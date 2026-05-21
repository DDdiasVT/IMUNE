"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Mail, Shield, User, Key, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export default function ClientAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role_description: "" // Ex: "Gestor de Tráfego", "Dono"
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchClientUsers();
  }, [clientId]);

  const fetchClientUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_id', clientId)
        .eq('role', 'client');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role_description: formData.role_description,
          client_id: clientId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar usuário.");

      setStatus({ type: 'success', msg: "Usuário criado com sucesso! Ele já pode logar." });
      fetchClientUsers();
      setIsModalOpen(false);
      setFormData({ email: "", password: "", full_name: "", role_description: "" });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Erro ao criar usuário." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestão de Acessos</h2>
          <p className="text-sm text-muted-foreground">Gerencie quem pode acessar o painel deste cliente.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Acesso
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{user.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{user.role_description || "Acesso Cliente"}</p>
                  </div>
                </div>
                <Shield className="h-4 w-4 text-primary opacity-50" />
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  Usuário Ativo
                </div>
                {/* Botão de excluir desativado por segurança no client-side admin, exige Service Role */}
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center bg-secondary/20 rounded-xl border-2 border-dashed border-border/50">
            <Key className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Nenhum acesso cadastrado para este cliente.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Criar Novo Acesso"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {status && (
            <div className={`p-3 rounded-lg text-xs text-center border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              {status.msg}
            </div>
          )}

          <Input 
            label="Nome Completo" 
            placeholder="Ex: João da Silva" 
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            required
          />
          <Input 
            label="E-mail de Login" 
            type="email"
            placeholder="cliente@email.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input 
            label="Senha Temporária" 
            type="password"
            placeholder="No mínimo 6 caracteres" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <Input 
            label="Cargo / Função" 
            placeholder="Ex: Gestor de Tráfego" 
            value={formData.role_description}
            onChange={(e) => setFormData({...formData, role_description: e.target.value})}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Acesso"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
