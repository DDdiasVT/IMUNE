"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Video, Image as ImageIcon, FileText, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ContentItem, Client } from "@/types";

const stages = [
  { id: "idea", title: "Ideia", color: "bg-slate-500" },
  { id: "copy", title: "Copy", color: "bg-blue-500" },
  { id: "design", title: "Design", color: "bg-purple-500" },
  { id: "approval", title: "Aprovação", color: "bg-amber-500" },
  { id: "scheduled", title: "Agendado", color: "bg-indigo-500" },
  { id: "posted", title: "Postado", color: "bg-emerald-500" },
];

import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";

export function ContentPipeline() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    type: "Reel",
    status: "idea" as ContentItem['status'],
    client_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: contentData } = await supabase.from('content_items').select('*').order('created_at', { ascending: false });
      const clientsData = await db.clients.list();
      setItems(contentData || []);
      setClients(clientsData);
    } catch (err) {
      console.error("Error fetching content data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        client_id: formData.client_id || null, // Se estiver vazio, salva como nulo
        assigned_to: "Joao Vitor",
      };

      if (editingItem) {
        await supabase.from('content_items').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('content_items').insert(payload);
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar conteúdo.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir conteúdo?")) {
      try {
        await supabase.from('content_items').delete().eq('id', id);
        fetchData();
      } catch (err) {
        console.error("Error deleting content:", err);
      }
    }
  };

  const openModal = (item?: ContentItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        type: item.type || "Reel",
        status: item.status,
        client_id: item.client_id || ""
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", type: "Reel", status: "idea", client_id: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full scrollbar-thin scrollbar-thumb-primary/10">
      {stages.map((stage) => (
        <div key={stage.id} className="kanban-column min-w-[320px] flex flex-col h-full bg-secondary/10 rounded-xl p-4 border border-border/50">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${stage.color} shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]`} />
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                {stage.title}
              </h3>
            </div>
            <Badge variant="secondary" className="bg-background/50">{items.filter(i => i.status === stage.id).length}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none pb-4">
            {items
              .filter((item) => item.status === stage.id)
              .map((item) => {
                const client = clients.find(c => c.id === item.client_id);
                return (
                  <Card key={item.id} className="kanban-card group p-4 border-l-4 border-primary">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-primary font-bold uppercase">{client?.name || 'Agência'}</p>
                        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal(item)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                       <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                       <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[8px]">JV</div>
                    </div>
                  </Card>
                );
              })}
            
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground border border-dashed border-border/50 shrink-0" onClick={() => { setFormData({...formData, status: stage.id as any}); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4" />
              <span className="text-sm">Novo Item</span>
            </Button>
          </div>
        </div>
      ))}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? "Editar Conteúdo" : "Novo Conteúdo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título / Tema" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Cliente</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
            >
              <option value="">Agência (Interno)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">Tipo</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Reel">Reel</option>
                <option value="Carrossel">Carrossel</option>
                <option value="Post">Post Estático</option>
                <option value="Story">Story</option>
                <option value="Vídeo">Vídeo Longo</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                {stages.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Conteúdo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
