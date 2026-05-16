"use client";

import { useState, useEffect } from "react";
import { Plus, Megaphone, Filter, Search, MoreHorizontal, ArrowRight, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";
import { Client } from "@/types";

const stages = [
  { id: "planning", title: "Planejamento", color: "bg-slate-500" },
  { id: "production", title: "Produção", color: "bg-blue-500" },
  { id: "approval", title: "Aprovação", color: "bg-purple-500" },
  { id: "running", title: "Rodando", color: "bg-emerald-500" },
  { id: "optimization", title: "Otimização", color: "bg-amber-500" },
  { id: "finished", title: "Finalizada", color: "bg-slate-900" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    client_id: "",
    budget: "",
    status: "planning",
    platform: "Meta Ads"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: camps } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      const clientsData = await db.clients.list();
      setCampaigns(camps || []);
      setClients(clientsData);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await supabase.from('campaigns').update({
          ...formData,
          budget: parseFloat(formData.budget || "0")
        }).eq('id', editingCampaign.id);
      } else {
        await supabase.from('campaigns').insert({
          ...formData,
          budget: parseFloat(formData.budget || "0")
        });
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar campanha.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir campanha?")) {
      await supabase.from('campaigns').delete().eq('id', id);
      fetchData();
    }
  };

  const openModal = (camp?: any) => {
    if (camp) {
      setEditingCampaign(camp);
      setFormData({
        name: camp.name,
        client_id: camp.client_id || "",
        budget: camp.budget?.toString() || "",
        status: camp.status,
        platform: camp.platform || "Meta Ads"
      });
    } else {
      setEditingCampaign(null);
      setFormData({ name: "", client_id: "", budget: "", status: "planning", platform: "Meta Ads" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campanhas</h2>
          <p className="text-muted-foreground">Gestão de tráfego pago e campanhas integradas.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-primary/10">
        <div className="flex gap-6 h-full">
          {stages.map((stage) => (
            <div key={stage.id} className="kanban-column min-w-[320px] flex flex-col h-full bg-secondary/10 rounded-xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    {stage.title}
                  </h3>
                </div>
                <Badge variant="secondary" className="bg-background/50">
                  {campaigns.filter((c) => c.status === stage.id).length}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none pb-4">
                {campaigns
                  .filter((c) => c.status === stage.id)
                  .map((camp) => {
                    const client = clients.find(cl => cl.id === camp.client_id);
                    return (
                      <Card key={camp.id} className="kanban-card group p-4 border-l-4 border-primary">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{client?.name || 'Agência'}</p>
                            <h4 className="font-semibold text-sm mt-1">{camp.name}</h4>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal(camp)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(camp.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/50">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Verba</p>
                            <p className="text-xs font-bold">R$ {camp.budget?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Plataforma</p>
                            <p className="text-xs font-bold">{camp.platform}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                
                <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground border border-dashed border-border/50 shrink-0" onClick={() => { setFormData({...formData, status: stage.id}); setIsModalOpen(true); }}>
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Planejar Campanha</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCampaign ? "Editar Campanha" : "Nova Campanha"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome da Campanha" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Cliente</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Verba Estimada (R$)" type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">Plataforma</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                <option value="Meta Ads">Meta Ads (Insta/FB)</option>
                <option value="Google Ads">Google Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="LinkedIn Ads">LinkedIn Ads</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Campanha</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
