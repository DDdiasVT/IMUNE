"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Briefcase, ChevronRight, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { db } from "@/lib/services";
import { Client } from "@/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    niche: "",
    status: "active" as Client['status'],
    responsible_id: "",
  });


  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await db.clients.list();
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await db.clients.update(editingClient.id, formData);
      } else {
        await db.clients.create({
          ...formData,
          logo_url: formData.name.substring(0, 2).toUpperCase(),
        });
      }
      fetchClients();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar cliente. Verifique se você rodou o SQL no Supabase.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await db.clients.delete(id);
        fetchClients();
      } catch (err) {
        console.error("Error deleting client:", err);
      }
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        niche: client.niche || "",
        status: client.status,
        responsible_id: client.responsible_id || "",
      });
    } else {
      setEditingClient(null);
      setFormData({ name: "", niche: "", status: "active", responsible_id: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.niche?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gerencie sua carteira de clientes e suas performances individuais.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome, nicho..." 
            className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="relative group">
            <Link href={`/clients/${client.id}`}>
              <Card className="hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {client.logo_url}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.niche}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                        <Badge variant={client.status === 'active' ? 'success' : 'secondary'} className="mt-1">
                          {client.status === 'active' ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Responsável</p>
                        <p className="text-sm font-medium mt-1">{client.responsible_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => { e.preventDefault(); openModal(client); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={(e) => handleDelete(client.id, e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingClient ? "Editar Cliente" : "Adicionar Cliente"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nome do Cliente" 
            placeholder="Ex: Dra. Mariana Costa" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Nicho / Ramo" 
            placeholder="Ex: Psicologia, E-commerce" 
            value={formData.niche}
            onChange={(e) => setFormData({...formData, niche: e.target.value})}
          />
          <Input 
            label="Responsável" 
            placeholder="Nome do gestor na agência" 
            value={formData.responsible_id}
            onChange={(e) => setFormData({...formData, responsible_id: e.target.value})}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingClient ? "Salvar Alterações" : "Criar Cliente"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
