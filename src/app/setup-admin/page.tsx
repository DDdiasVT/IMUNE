"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function SetupAdminPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const createAppAdmin = async () => {
    setStatus("loading");
    setMessage("Criando conta mestre...");

    try {
      // 1. Tentar cadastrar o usuário
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: "joaovitordiaso@hotmail.com",
        password: "Jucabala123",
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setMessage("Essa conta já existe no Auth. Vamos tentar promover para Admin...");
        } else {
          throw signUpError;
        }
      }

      const userId = data.user?.id || (await supabase.auth.signInWithPassword({
        email: "joaovitordiaso@hotmail.com",
        password: "Jucabala123",
      })).data.user?.id;

      if (!userId) throw new Error("Não foi possível obter o ID do usuário.");

      // 2. Tentar criar o perfil de admin
      // Nota: Se o RLS barrar, pediremos para rodar o SQL, mas tentaremos aqui primeiro
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: "Joao Vitor (Admin)",
          role: "admin"
        });

      if (profileError) {
        console.error(profileError);
        setMessage("Usuário criado, mas o banco bloqueou a promoção para Admin. Por favor, rode o SQL que te passei no painel do Supabase.");
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
            Clique no botão abaixo para gerar o acesso mestre para <strong>joaovitordiaso@hotmail.com</strong>.
          </p>

          {status === "idle" && (
            <Button onClick={createAppAdmin} className="w-full">
              Gerar meu Acesso Agora
            </Button>
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
