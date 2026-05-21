"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Phone, AtSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Lead } from "@/types";
import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export type PipelineStage = {
  id: string;
  name: string;
  color: string;
};

export const DEFAULT_STAGES: PipelineStage[] = [
  { id: "new_lead", name: "Novo Lead", color: "#3b82f6" },
  { id: "contact_initiated", name: "Contato Iniciado", color: "#f59e0b" },
  { id: "qualified", name: "Qualificado", color: "#a855f7" },
  { id: "scheduled", name: "Agendado", color: "#6366f1" },
  { id: "closed", name: "Fechado", color: "#10b981" },
  { id: "lost", name: "Perdido", color: "#ef4444" },
];

function LeadCard({ lead, onEdit, onDelete, dimmed = false }: {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  dimmed?: boolean;
}) {
  return (
    <Card className={`kanban-card group p-4 border-t-2 transition-opacity ${dimmed ? "opacity-30" : ""}`} style={{ borderTopColor: "var(--primary)" }}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-sm">{lead.name}</h4>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onPointerDown={(e) => e.stopPropagation()} onClick={() => onEdit(lead)}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(lead.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="space-y-2 mt-3">
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />{lead.phone}
          </div>
        )}
        {lead.instagram && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AtSign className="h-3 w-3" />{lead.instagram}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{lead.source}</span>
        <p className="text-xs font-bold text-primary">R$ {lead.potential_value?.toLocaleString() || "0"}</p>
      </div>
    </Card>
  );
}

function DraggableCard({ lead, onEdit, onDelete }: { lead: Lead; onEdit: (lead: Lead) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
      <LeadCard lead={lead} onEdit={onEdit} onDelete={onDelete} dimmed={isDragging} />
    </div>
  );
}

function DroppableColumn({ stage, children }: { stage: PipelineStage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={`kanban-column min-w-[280px] md:min-w-[320px] flex flex-col h-full rounded-xl p-4 border snap-center transition-colors duration-150 ${isOver ? "border-primary bg-primary/10" : "bg-secondary/10 border-border/50"}`}
    >
      {children}
    </div>
  );
}

export function KanbanBoard({ clientId, stages: stagesProp }: { clientId?: string; stages?: PipelineStage[] } = {}) {
  const stages = stagesProp && stagesProp.length > 0 ? stagesProp : DEFAULT_STAGES;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<{
    name: string; phone: string; instagram: string; source: string;
    status: Lead['status']; potential_value: string;
  }>({
    name: "", phone: "", instagram: "", source: "",
    status: (stages[0]?.id ?? "new_lead") as Lead['status'],
    potential_value: "",
  });

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleFormData, setSaleFormData] = useState({
    service_id: "", value: "", is_recurring: false,
    salesperson_id: "", closing_date: new Date().toISOString().split("T")[0],
  });
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    fetchLeads();
    fetchSaleMetadata();
  }, [clientId]);

  const fetchLeads = async () => {
    try {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (clientId) query = query.eq("client_id", clientId);
      const { data, error } = await query;
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleMetadata = async () => {
    const [sp, sv] = await Promise.all([
      supabase.from("salespeople").select("*"),
      supabase.from("services").select("*"),
    ]);
    setSalespeople(sp.data || []);
    setServices(sv.data || []);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const lead = leads.find((l) => l.id === active.id);
    const newStatus = over.id as string;
    if (!lead || lead.status === newStatus) return;

    const closedStage = stages.find(s => s.id === "closed");
    if (closedStage && newStatus === closedStage.id && lead.status !== closedStage.id) {
      setEditingLead(lead);
      setIsSaleModalOpen(true);
      return;
    }

    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: newStatus as Lead['status'] } : l));
    try {
      await db.leads.update(lead.id, { status: newStatus as Lead['status'] });
    } catch {
      fetchLeads();
    }
  };

  const handleCloseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: newClient } = await supabase.from("clients").insert({
        name: editingLead?.name, niche: editingLead?.source, status: "active",
      }).select().single();

      const salesperson = salespeople.find((s) => s.id === saleFormData.salesperson_id);
      const val = parseFloat(saleFormData.value);
      const commission_value = val * ((salesperson?.commission_percentage || 0) / 100);

      await supabase.from("sales").insert({
        client_id: newClient.id, salesperson_id: saleFormData.salesperson_id,
        service_id: saleFormData.service_id, value: val, commission_value,
        discount: 0, is_recurring: saleFormData.is_recurring, closing_date: saleFormData.closing_date,
      });

      await db.leads.update(editingLead!.id, { status: "closed" });
      setIsSaleModalOpen(false);
      fetchLeads();
    } catch {
      alert("Erro ao fechar venda.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const potential_value = parseFloat(formData.potential_value || "0");
    try {
      if (editingLead) {
        const closedStage = stages.find(s => s.id === "closed");
        if (closedStage && formData.status === closedStage.id && editingLead.status !== closedStage.id) {
          setEditingLead({ ...editingLead, ...formData, potential_value });
          setIsSaleModalOpen(true);
          return;
        }
        await db.leads.update(editingLead.id, { ...formData, potential_value });
      } else {
        await db.leads.create({ ...formData, potential_value, ...(clientId ? { client_id: clientId } : {}) });
      }
      fetchLeads();
      closeModal();
    } catch {
      alert("Erro ao salvar lead.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir lead?")) {
      try { await db.leads.delete(id); fetchLeads(); }
      catch (err) { console.error(err); }
    }
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({ name: lead.name, phone: lead.phone || "", instagram: lead.instagram || "", source: lead.source || "", status: lead.status, potential_value: lead.potential_value?.toString() || "" });
    } else {
      setEditingLead(null);
      setFormData({ name: "", phone: "", instagram: "", source: "", status: (stages[0]?.id ?? "new_lead") as Lead['status'], potential_value: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingLead(null); };
  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 h-full scrollbar-thin scrollbar-thumb-primary/10 snap-x snap-mandatory px-1">
        {stages.map((stage) => (
          <DroppableColumn key={stage.id} stage={stage}>
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{stage.name}</h3>
              </div>
              <Badge variant="secondary" className="bg-background/50">
                {leads.filter((l) => l.status === stage.id).length}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none pb-4">
              {leads.filter((l) => l.status === stage.id).map((lead) => (
                <DraggableCard key={lead.id} lead={lead} onEdit={openModal} onDelete={handleDelete} />
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground border border-dashed border-border/50 shrink-0"
                onClick={() => { setFormData(f => ({ ...f, status: stage.id as Lead['status'] })); setIsModalOpen(true); }}
              >
                <Plus className="h-4 w-4" /><span className="text-sm">Novo Lead</span>
              </Button>
            </div>
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="rotate-2 scale-105 shadow-2xl shadow-primary/20">
            <LeadCard lead={activeLead} onEdit={() => {}} onDelete={() => {}} />
          </div>
        )}
      </DragOverlay>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingLead ? "Editar Lead" : "Novo Lead"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Telefone / WhatsApp" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <Input label="Instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Origem" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
            <Input label="Valor Potencial (R$)" type="number" value={formData.potential_value} onChange={(e) => setFormData({ ...formData, potential_value: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Etapa do Funil</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
            >
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Lead</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} title="🔥 Fechar Novo Negócio">
        <form onSubmit={handleCloseDeal} className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
            <p className="text-sm font-medium text-primary">Registre os detalhes financeiros da venda para <strong>{editingLead?.name}</strong>.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Serviço Contratado</label>
            <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={saleFormData.service_id} onChange={(e) => setSaleFormData({ ...saleFormData, service_id: e.target.value })} required>
              <option value="">Selecione o serviço...</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Valor Final (R$)" type="number" value={saleFormData.value} onChange={(e) => setSaleFormData({ ...saleFormData, value: e.target.value })} required />
            <Input label="Data de Fechamento" type="date" value={saleFormData.closing_date} onChange={(e) => setSaleFormData({ ...saleFormData, closing_date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Vendedor</label>
              <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={saleFormData.salesperson_id} onChange={(e) => setSaleFormData({ ...saleFormData, salesperson_id: e.target.value })} required>
                <option value="">Quem vendeu?</option>
                {salespeople.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.commission_percentage}%)</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input type="checkbox" id="recurring" checked={saleFormData.is_recurring} onChange={(e) => setSaleFormData({ ...saleFormData, is_recurring: e.target.checked })} />
              <label htmlFor="recurring" className="text-sm font-medium">Contrato Recorrente?</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" type="button" onClick={() => setIsSaleModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">Confirmar e Criar Cliente</Button>
          </div>
        </form>
      </Modal>
    </DndContext>
  );
}
