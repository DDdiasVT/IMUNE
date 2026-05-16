"use client";

import React, { useState, useEffect } from "react";
import { Plus, FileText, Video, MessageSquare, CheckCircle2, Clock, Image as ImageIcon, Send, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function ClientContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "Reel",
    status: "idea",
    script: "",
    caption: "",
    attachments: ""
  });

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      client_id: id,
      attachments: formData.attachments.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (editingItem) {
      await supabase.from('content_items').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('content_items').insert(payload);
    }
    fetchContent();
    closeModal();
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        type: item.type,
        status: item.status,
        script: item.script || "",
        caption: item.caption || "",
        attachments: item.attachments?.join(', ') || ""
      });
    } else {
      setEditingItem(null);
      setFormData({ title: "", type: "Reel", status: "idea", script: "", caption: "", attachments: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Produção de Conteúdo</h3>
          <p className="text-sm text-muted-foreground">Planejamento e aprovação de materiais.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Pauta
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-0 overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
            <div className="p-4 flex items-center justify-between bg-secondary/10 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {item.type === 'Reel' || item.type === 'Vídeo' ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={item.status === 'posted' ? 'success' : 'secondary'} className="text-[10px]">
                  {item.status.toUpperCase()}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Editar</Button>
              </div>
            </div>

            <div className="p-4 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <FileText className="h-3 w-3" /> Roteiro / Ideia
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-background/50 p-3 rounded-lg border">
                  {item.script || "Nenhum roteiro definido."}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <MessageSquare className="h-3 w-3" /> Legenda / Copy
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-background/50 p-3 rounded-lg border italic">
                  {item.caption || "Aguardando escrita da copy..."}
                </p>
              </div>
            </div>
            
            {item.attachments?.length > 0 && (
              <div className="px-4 pb-4 flex gap-2">
                {item.attachments.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" className="flex items-center gap-2 text-[10px] bg-secondary px-2 py-1 rounded hover:bg-primary/10 transition-colors">
                    <ExternalLink className="h-3 w-3" /> Link de Referência {i+1}
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? "Editar Pauta" : "Nova Pauta"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Título do Conteúdo" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="Reel">Reel</option>
                <option value="Carrossel">Carrossel</option>
                <option value="Post">Post Estático</option>
                <option value="Vídeo">Vídeo Longo</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Roteiro / Estrutura do Vídeo</label>
            <textarea 
              className="w-full min-h-[100px] rounded-lg border bg-secondary/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.script}
              onChange={(e) => setFormData({...formData, script: e.target.value})}
              placeholder="Descreva a ideia ou o roteiro passo a passo..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Legenda (Copy)</label>
            <textarea 
              className="w-full min-h-[100px] rounded-lg border bg-secondary/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.caption}
              onChange={(e) => setFormData({...formData, caption: e.target.value})}
              placeholder="Escreva a legenda final com CTAs e Hashtags..."
            />
          </div>

          <Input label="Links de Referência (separados por vírgula)" value={formData.attachments} onChange={(e) => setFormData({...formData, attachments: e.target.value})} placeholder="Google Drive, Canva, Loom..." />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Conteúdo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
