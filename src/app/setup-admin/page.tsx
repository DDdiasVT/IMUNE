"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function SetupAdminPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createAppAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("Autenticando...");

    try {
      // Tenta login primeiro (conta já existe)
      let userId: string | undefined;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (!signInError && signInData.user) {
        userId = signInData.user.id;
        setMessage("Conta autenticada. Vinculando perfil de Admin...");
      } else {
        // Conta não existe ainda — cria
        setMessage("Criando conta...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        userId = signUpData.user?.id;
        if (!userId) throw new Error("Não foi possível obter o ID do usuário após cadastro.");
        setMessage("Conta criada. Vinculando perfil de Admin...");
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: userId, full_name: "Admin", role: "admin" }, { onConflict: "id" });

      if (profileError) {
        console.error("Erro no upsert do perfil:", profileError);
        setMessage(`Conta OK, mas o banco bloqueou o perfil (RLS). Rode este SQL no painel do Supabase:\n\nINSERT INTO profiles (id, full_name, role) VALUES ('${userId}', 'Admin', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';`);
        setStatus("error");
      } else {
        setMessage("Sucesso! Você agora é o Administrador Mestre da IMUNE OS.");
        setStatus("success");
      }
    } catch (err: any) {
      setMessage("Erro: " + err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-primary/20 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Configuração de Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-sm text-muted-foreground">
            Informe os dados da conta que receberá acesso de administrador mestre.
          </p>

          {status === "idle" && (
            <form onSubmit={createAppAdmin} className="space-y-4 text-left">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Gerar Acesso de Admin
              </Button>
            </form>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg">
                {message}
              </div>
              <Button className="w-full" onClick={() => window.location.href = "/login"}>
                Ir para o Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
                {message}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setStatus("idle")}>
                Tentar Novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
