"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Rocket, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Credenciais inválidas ou erro de conexão.");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-[9999]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5" />
      
      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] mb-4">
            <Rocket className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">IMUNE</h1>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">Performance OS</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-lg">Acesse sua plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg text-center">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="w-full h-12 pl-10 pr-4 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="password" 
                  placeholder="Sua senha" 
                  className="w-full h-12 pl-10 pr-4 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 gap-2 text-lg font-bold" disabled={loading}>
                {loading ? "Entrando..." : "Entrar na Plataforma"}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
                onClick={async () => {
                  if (!email) {
                    alert("Preencha o campo de e-mail antes de solicitar o link.");
                    return;
                  }
                  const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: { emailRedirectTo: window.location.origin }
                  });
                  if (error) alert(error.message);
                  else alert("Link de acesso enviado! Verifique seu e-mail.");
                }}
              >
                Problemas com a senha? Receber link por e-mail
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground uppercase tracking-widest">
          &copy; {new Date().getFullYear()} IMUNE PERFORMANCE
        </p>
      </div>
    </div>
  );
}
