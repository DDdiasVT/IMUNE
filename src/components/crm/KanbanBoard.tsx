"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, User, Trash2, Edit2, Phone, AtSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Lead } from "@/types";

const columns = [
  { id: "new_lead", title: "Novo Lead", color: "bg-blue-500" },
  { id: "contact_initiated", title: "Contato Iniciado", color: "bg-amber-500" },
  { id: "qualified", title: "Qualificado", color: "bg-purple-500" },
  { id: "scheduled", title: "Agendado", color: "bg-indigo-500" },
  { id: "closed", title: "Fechado", color: "bg-emerald-500" },
  { id: "lost", title: "Perdido", color: "bg-red-500" },
];

import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    instagram: "",
    source: "",
    status: "new_lead" as Lead['status'],
    potential_value: ""
  });

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleFormData, setSaleFormData] = useState({
    service_id: "",
    value: "",
    is_recurring: false,
    salesperson_id: "",
    closing_date: new Date().toISOString().split('T')[0]
  });
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
    fetchSaleMetadata();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await db.leads.list();
      setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleMetadata = async () => {
    const [sp, sv] = await Promise.all([
      supabase.from('salespeople').select('*'),
      supabase.from('services').select('*')
    ]);
    setSalespeople(sp.data || []);
    setServices(sv.data || []);
  };

  const handleCloseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Criar Cliente Real
      const { data: newClient } = await supabase.from('clients').insert({
        name: editingLead?.name,
        niche: editingLead?.source,
        status: 'active'
      }).select().single();

      // 2. Criar Venda
      const salesperson = salespeople.find(s => s.id === saleFormData.salesperson_id);
      const val = parseFloat(saleFormData.value);
      const commission_value = val * ((salesperson?.commission_rate || 0) / 100);

      await supabase.from('sales').insert({
        client_id: newClient.id,
        salesperson_id: saleFormData.salesperson_id,
        service_id: saleFormData.service_id,
        value: val,
        commission_value,
        is_recurring: saleFormData.is_recurring,
        closing_date: saleFormData.closing_date
      });

      // 3. Marcar Lead como Fechado
      await db.leads.update(editingLead!.id, { status: 'closed' });

      setIsSaleModalOpen(false);
      fetchLeads();
      alert("Venda registrada com sucesso! Cliente criado.");
    } catch (err) {
      alert("Erro ao fechar venda.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const potential_value = parseFloat(formData.potential_value || "0");
    try {
      if (editingLead) {
        // Se mudou para fechado agora, abre o modal de venda
        if (formData.status === 'closed' && editingLead.status !== 'closed') {
          setEditingLead({ ...editingLead, ...formData, potential_value });
          setIsSaleModalOpen(true);
          return;
        }
        await db.leads.update(editingLead.id, { ...formData, potential_value });
      } else {
        await db.leads.create({ ...formData, potential_value });
      }
      fetchLeads();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar lead.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir lead?")) {
      try {
        await db.leads.delete(id);
        fetchLeads();
      } catch (err) {
        console.error("Error deleting lead:", err);
      }
    }
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        phone: lead.phone || "",
        instagram: lead.instagram || "",
        source: lead.source || "",
        status: lead.status,
        potential_value: lead.potential_value?.toString() || ""
      });
    } else {
      setEditingLead(null);
      setFormData({ name: "", phone: "", instagram: "", source: "", status: "new_lead", potential_value: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 h-full scrollbar-thin scrollbar-thumb-primary/10 snap-x snap-mandatory px-1">
      {columns.map((column) => (
        <div key={column.id} className="kanban-column min-w-[280px] md:min-w-[320px] flex flex-col h-full bg-secondary/10 rounded-xl p-4 border border-border/50 snap-center">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${column.color} shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]`} />
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                {column.title}
              </h3>
            </div>
            <Badge variant="secondary" className="bg-background/50">{leads.filter(l => l.status === column.id).length}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none pb-4">
            {leads
              .filter((lead) => lead.status === column.id)
              .map((lead) => (
                <Card key={lead.id} className="kanban-card group p-4 border-t-2 border-primary">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-sm">{lead.name}</h4>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openModal(lead)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(lead.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.instagram && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AtSign className="h-3 w-3" />
                        {lead.instagram}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{lead.source}</span>
                    <p className="text-xs font-bold text-primary">R$ {lead.potential_value?.toLocaleString() || '0'}</p>
                  </div>
                </Card>
              ))}
            
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground border border-dashed border-border/50 shrink-0" onClick={() => { setFormData({...formData, status: column.id as any}); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4" />
              <span className="text-sm">Novo Lead</span>
            </Button>
          </div>
        </div>
      ))}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingLead ? "Editar Lead" : "Novo Lead"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone / WhatsApp" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <Input label="Instagram" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Origem" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} />
            <Input label="Valor Potencial (R$)" type="number" value={formData.potential_value} onChange={(e) => setFormData({...formData, potential_value: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Etapa do Funil</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Lead</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Fechamento de Venda */}
      <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} title="🔥 Fechar Novo Negócio">
        <form onSubmit={handleCloseDeal} className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
            <p className="text-sm font-medium text-primary">Parabéns! Vamos registrar os detalhes financeiros desta venda para o lead <strong>{editingLead?.name}</strong>.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Serviço Contratado</label>
            <select 
              className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" 
              value={saleFormData.service_id} 
              onChange={e => setSaleFormData({...saleFormData, service_id: e.target.value})}
              required
            >
              <option value="">Selecione o serviço...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor Final (R$)" 
              type="number" 
              value={saleFormData.value} 
              onChange={e => setSaleFormData({...saleFormData, value: e.target.value})} 
              required 
            />
            <Input 
              label="Data de Fechamento" 
              type="date" 
              value={saleFormData.closing_date} 
              onChange={e => setSaleFormData({...saleFormData, closing_date: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Vendedor</label>
              <select 
                className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" 
                value={saleFormData.salesperson_id} 
                onChange={e => setSaleFormData({...saleFormData, salesperson_id: e.target.value})}
                required
              >
                <option value="">Quem vendeu?</option>
                {salespeople.map(s => <option key={s.id} value={s.id}>{s.name} ({s.commission_rate}%)</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input 
                type="checkbox" 
                id="recurring" 
                checked={saleFormData.is_recurring} 
                onChange={e => setSaleFormData({...saleFormData, is_recurring: e.target.checked})} 
              />
              <label htmlFor="recurring" className="text-sm font-medium">Contrato Recorrente?</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" type="button" onClick={() => setIsSaleModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">Confirmar e Criar Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
