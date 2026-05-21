"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  ChevronLeft, Edit2, Target, Users, Plus, Trash2,
  ExternalLink, TrendingUp, DollarSign, BarChart3,
  Save, RefreshCw,
} from "lucide-react";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, DragEndEvent, DragStartEvent,
  useDroppable, useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ─── Constantes ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bgColor: string }> = {
  planning:     { label: "Planejamento", bgColor: "bg-slate-500" },
  production:   { label: "Produção",     bgColor: "bg-blue-500" },
  approval:     { label: "Aprovação",    bgColor: "bg-purple-500" },
  running:      { label: "Rodando",      bgColor: "bg-emerald-500" },
  optimization: { label: "Otimização",   bgColor: "bg-amber-500" },
  finished:     { label: "Finalizada",   bgColor: "bg-slate-700" },
};

const PLATFORMS  = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "YouTube Ads", "Orgânico"];
const OBJECTIVES = [
  "Geração de Leads", "Conversão", "Tráfego", "Lançamento",
  "Reconhecimento de Marca", "Vendas Diretas", "Retenção",
];

const TASK_STAGES = [
  { id: "pending",     label: "A Fazer",      color: "#3b82f6", bg: "bg-blue-500/5",    border: "border-blue-500/20" },
  { id: "in_progress", label: "Em Andamento",  color: "#f59e0b", bg: "bg-amber-500/5",   border: "border-amber-500/20" },
  { id: "completed",   label: "Concluído",     color: "#10b981", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
] as const;

const PRIORITY: Record<string, { dot: string; label: string }> = {
  high:   { dot: "bg-red-500",   label: "Alta" },
  medium: { dot: "bg-amber-500", label: "Média" },
  low:    { dot: "bg-slate-400", label: "Baixa" },
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KPICard({ title, icon: Icon, actual, goal, prefix = "", suffix = "", lowerIsBetter = false }: {
  title: string; icon: any; actual: number; goal: number;
  prefix?: string; suffix?: string; lowerIsBetter?: boolean;
}) {
  const rawPct = goal > 0 ? (actual / goal) * 100 : 0;
  const barPct = lowerIsBetter && actual > 0 && goal > 0
    ? Math.min((goal / actual) * 100, 100)
    : Math.min(rawPct, 100);
  const achieved = goal > 0 && (lowerIsBetter ? actual <= goal && actual > 0 : actual >= goal);

  return (
    <Card className={`transition-colors ${achieved ? "border-emerald-500/50 bg-emerald-500/5" : "hover:border-primary/30"}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
          </div>
          {achieved && <span className="text-[10px] font-black text-emerald-500">✓ Meta</span>}
        </div>
        <div>
          <p className="text-xl font-black">
            {prefix}{actual > 0 ? actual.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "0"}{suffix}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Meta: {goal > 0 ? `${prefix}${goal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${suffix}` : "—"}
          </p>
        </div>
        {goal > 0 && (
          <div className="space-y-0.5">
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${achieved ? "bg-emerald-500" : "bg-primary"}`}
                style={{ width: `${barPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{barPct.toFixed(0)}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Kanban de Tarefas ───────────────────────────────────────────────────────

function TaskCard({ task, onDelete, dimmed = false }: { task: any; onDelete: (id: string) => void; dimmed?: boolean }) {
  const p = PRIORITY[task.priority] || PRIORITY.medium;
  return (
    <Card className={`p-3 group border transition-all ${dimmed ? "opacity-30" : "hover:border-primary/30 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${p.dot}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug">{task.title}</p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost" size="icon"
          className="h-6 w-6 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="mt-2 ml-4">
        <span className={`text-[10px] font-bold uppercase ${p.dot === "bg-red-500" ? "text-red-400" : p.dot === "bg-amber-500" ? "text-amber-400" : "text-slate-400"}`}>
          {p.label}
        </span>
      </div>
    </Card>
  );
}

function DraggableTask({ task, onDelete }: { task: any; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
      <TaskCard task={task} onDelete={onDelete} dimmed={isDragging} />
    </div>
  );
}

function DroppableColumn({
  stage, tasks, onDelete, onAdd, isOver: _over,
}: {
  stage: typeof TASK_STAGES[number];
  tasks: any[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  isOver?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] sm:min-w-[300px] h-full rounded-xl border p-4 transition-colors duration-150 snap-center ${
        isOver ? "border-primary bg-primary/5" : `${stage.bg} ${stage.border}`
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground">{stage.label}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{tasks.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-none pb-4">
        {tasks.map(task => (
          <DraggableTask key={task.id} task={task} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <button
            onClick={onAdd}
            className="w-full py-8 border-2 border-dashed border-border/30 rounded-xl text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            + Adicionar tarefa
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string; campaignId: string }>;
}) {
  const { id: clientId, campaignId } = React.use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<any>(null);
  const [tasks,    setTasks]    = useState<any[]>([]);
  const [members,  setMembers]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Modal states
  const [isEditOpen,   setIsEditOpen]   = useState(false);
  const [isKPIOpen,    setIsKPIOpen]    = useState(false);
  const [isTaskOpen,   setIsTaskOpen]   = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);

  // Forms
  const [editForm,   setEditForm]   = useState<any>({});
  const [kpiForm,    setKpiForm]    = useState({ spent: "", leads_actual: "", roas_actual: "", revenue_actual: "" });
  const [taskForm,   setTaskForm]   = useState({ title: "", description: "", priority: "medium", status: "pending" });
  const [memberForm, setMemberForm] = useState({ name: "", role: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => { fetchAll(); }, [campaignId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [campRes, tasksRes, membersRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", campaignId).single(),
        supabase.from("tasks").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: true }),
        supabase.from("campaign_members").select("*").eq("campaign_id", campaignId).order("created_at"),
      ]);
      const c = campRes.data;
      setCampaign(c);
      setTasks(tasksRes.data || []);
      setMembers(membersRes.data || []);
      if (c) {
        setEditForm({
          name: c.name || "", description: c.description || "",
          objective: c.objective || "", platform: c.platform || "Meta Ads",
          status: c.status || "planning",
          start_date: c.start_date || "", end_date: c.end_date || "",
          budget: c.budget?.toString() || "",
          goal_leads:   c.goal_leads?.toString()   || "",
          goal_cpl:     c.goal_cpl?.toString()     || "",
          goal_roas:    c.goal_roas?.toString()     || "",
          goal_revenue: c.goal_revenue?.toString()  || "",
          manager_url: c.manager_url || "",
        });
        setKpiForm({
          spent:          c.spent?.toString()          || "",
          leads_actual:   c.leads_actual?.toString()   || "",
          roas_actual:    c.roas_actual?.toString()    || "",
          revenue_actual: c.revenue_actual?.toString() || "",
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd   = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const task = tasks.find(t => t.id === active.id);
    const newStatus = over.id as string;
    if (!task || task.status === newStatus) return;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("campaigns").update({
      name: editForm.name, description: editForm.description || null,
      objective: editForm.objective || null, platform: editForm.platform,
      status: editForm.status,
      start_date: editForm.start_date || null, end_date: editForm.end_date || null,
      budget:       parseFloat(editForm.budget       || "0"),
      goal_leads:   parseInt(editForm.goal_leads      || "0"),
      goal_cpl:     parseFloat(editForm.goal_cpl      || "0"),
      goal_roas:    parseFloat(editForm.goal_roas      || "0"),
      goal_revenue: parseFloat(editForm.goal_revenue   || "0"),
      manager_url: editForm.manager_url || null,
      updated_at: new Date().toISOString(),
    }).eq("id", campaignId);
    setIsEditOpen(false);
    fetchAll();
  };

  const handleKPISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("campaigns").update({
      spent:          parseFloat(kpiForm.spent          || "0"),
      leads_actual:   parseInt(kpiForm.leads_actual      || "0"),
      roas_actual:    parseFloat(kpiForm.roas_actual      || "0"),
      revenue_actual: parseFloat(kpiForm.revenue_actual   || "0"),
      updated_at: new Date().toISOString(),
    }).eq("id", campaignId);
    setIsKPIOpen(false);
    fetchAll();
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("tasks").insert({
      title: taskForm.title,
      description: taskForm.description || null,
      priority: taskForm.priority,
      status: taskForm.status,
      client_id: clientId,
      campaign_id: campaignId,
    });
    setTaskForm({ title: "", description: "", priority: "medium", status: "pending" });
    setIsTaskOpen(false);
    fetchAll();
  };

  const openTaskModal = (stageId: string) => {
    setTaskForm({ title: "", description: "", priority: "medium", status: stageId });
    setIsTaskOpen(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("campaign_members").insert({ campaign_id: campaignId, name: memberForm.name, role: memberForm.role });
    setMemberForm({ name: "", role: "" });
    setIsMemberOpen(false);
    fetchAll();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Excluir esta tarefa?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteMember = async (id: string) => {
    await supabase.from("campaign_members").delete().eq("id", id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-60 flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!campaign) return <div className="text-center py-20 text-muted-foreground">Campanha não encontrada.</div>;

  const statusInfo = STATUS_MAP[campaign.status] || STATUS_MAP.planning;
  const spent      = campaign.spent || 0;
  const spentPct   = campaign.budget > 0 ? Math.min((spent / campaign.budget) * 100, 100) : 0;
  const cplActual  = (campaign.leads_actual || 0) > 0 ? (spent / campaign.leads_actual) : 0;
  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground"
          onClick={() => router.push(`/clients/${clientId}/campaigns`)}>
          <ChevronLeft className="h-4 w-4" /> Campanhas
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${statusInfo.bgColor} text-white border-0 text-xs`}>{statusInfo.label}</Badge>
              {campaign.platform  && <Badge variant="secondary" className="text-xs">{campaign.platform}</Badge>}
              {campaign.objective && <Badge variant="outline"   className="text-xs">{campaign.objective}</Badge>}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{campaign.name}</h2>
            {campaign.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">{campaign.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {(campaign.start_date || campaign.end_date) && (
                <span>{formatDate(campaign.start_date) ?? "?"} → {formatDate(campaign.end_date) ?? "?"}</span>
              )}
              {campaign.budget > 0 && (
                <span className="font-semibold text-foreground">Verba: R$ {campaign.budget.toLocaleString()}</span>
              )}
              {campaign.manager_url && (
                <a href={campaign.manager_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline text-xs">
                  <ExternalLink className="h-3 w-3" /> Gerenciador
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsKPIOpen(true)}>
              <RefreshCw className="h-4 w-4" /> Atualizar Dados
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="h-4 w-4" /> Editar
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Leads"   icon={Target}    actual={campaign.leads_actual   || 0} goal={campaign.goal_leads    || 0} />
        <KPICard title="CPL"     icon={DollarSign} actual={cplActual}               goal={campaign.goal_cpl      || 0} prefix="R$ " lowerIsBetter />
        <KPICard title="ROAS"    icon={TrendingUp} actual={campaign.roas_actual    || 0} goal={campaign.goal_roas   || 0} suffix="x" />
        <KPICard title="Receita" icon={BarChart3}  actual={campaign.revenue_actual || 0} goal={campaign.goal_revenue || 0} prefix="R$ " />
      </div>

      {/* ── BUDGET BAR ────────────────────────────────────────────────────── */}
      {campaign.budget > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold">Investimento</h4>
                <p className="text-xs text-muted-foreground">
                  R$ {spent.toLocaleString()} de R$ {campaign.budget.toLocaleString()} utilizados
                </p>
              </div>
              <span className="text-xl font-black text-primary">{spentPct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${spentPct}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── KANBAN DE TAREFAS ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Tarefas da Campanha</h3>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status !== "completed").length} pendentes · {tasks.length} no total · aparece também em Tarefas
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => openTaskModal("pending")}>
            <Plus className="h-4 w-4" /> Nova Tarefa
          </Button>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/10 -mx-1 px-1">
            {TASK_STAGES.map(stage => (
              <DroppableColumn
                key={stage.id}
                stage={stage}
                tasks={tasks.filter(t => t.status === stage.id)}
                onDelete={deleteTask}
                onAdd={() => openTaskModal(stage.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onDelete={() => {}} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── EQUIPE + DETALHES ─────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipe */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Equipe</h3>
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setIsMemberOpen(true)}>
              <Plus className="h-3 w-3" /> Membro
            </Button>
          </div>
          {members.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl">
              <Users className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Adicione os responsáveis desta campanha</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 border rounded-xl group">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                  </div>
                  <Button variant="ghost" size="icon"
                    className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
                    onClick={() => deleteMember(m.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo / detalhes extras */}
        <div className="space-y-3">
          <h3 className="text-base font-bold">Resumo</h3>
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={`${statusInfo.bgColor} text-white border-0 text-xs`}>{statusInfo.label}</Badge>
              </div>
              {campaign.platform && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plataforma</span>
                  <span className="font-medium">{campaign.platform}</span>
                </div>
              )}
              {campaign.objective && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objetivo</span>
                  <span className="font-medium">{campaign.objective}</span>
                </div>
              )}
              {campaign.budget > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verba</span>
                  <span className="font-medium">R$ {campaign.budget.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarefas concluídas</span>
                <span className="font-medium">{tasks.filter(t => t.status === "completed").length} / {tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Membros na equipe</span>
                <span className="font-medium">{members.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* EDITAR CAMPANHA */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Campanha">
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <Input label="Nome *" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Descrição</label>
            <textarea
              className="w-full min-h-[80px] bg-secondary/50 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Objetivo</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={editForm.objective} onChange={e => setEditForm({ ...editForm, objective: e.target.value })}>
                <option value="">Selecione...</option>
                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Plataforma</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={editForm.platform} onChange={e => setEditForm({ ...editForm, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data de Início" type="date" value={editForm.start_date} onChange={e => setEditForm({ ...editForm, start_date: e.target.value })} />
            <Input label="Data de Término" type="date" value={editForm.end_date} onChange={e => setEditForm({ ...editForm, end_date: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Verba (R$)" type="number" value={editForm.budget} onChange={e => setEditForm({ ...editForm, budget: e.target.value })} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
          </div>
          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Metas de Performance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Meta de Leads"      type="number"       value={editForm.goal_leads}   onChange={e => setEditForm({ ...editForm, goal_leads:   e.target.value })} />
              <Input label="CPL Alvo (R$)"      type="number"       value={editForm.goal_cpl}     onChange={e => setEditForm({ ...editForm, goal_cpl:     e.target.value })} />
              <Input label="ROAS Alvo"          type="number" step="0.1" value={editForm.goal_roas}  onChange={e => setEditForm({ ...editForm, goal_roas:    e.target.value })} />
              <Input label="Meta de Receita (R$)" type="number"     value={editForm.goal_revenue} onChange={e => setEditForm({ ...editForm, goal_revenue: e.target.value })} />
            </div>
          </div>
          <Input label="URL Gerenciador de Anúncios" type="url" value={editForm.manager_url} onChange={e => setEditForm({ ...editForm, manager_url: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* ATUALIZAR KPIs */}
      <Modal isOpen={isKPIOpen} onClose={() => setIsKPIOpen(false)} title="Atualizar Dados Reais">
        <form onSubmit={handleKPISubmit} className="space-y-4">
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground">
            Insira os dados reais obtidos até hoje. O CPL será calculado automaticamente.
          </div>
          <Input label="Investimento Real (R$)" type="number" step="0.01" value={kpiForm.spent} onChange={e => setKpiForm({ ...kpiForm, spent: e.target.value })} placeholder="Ex: 2350.00" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Leads Obtidos"  type="number"       value={kpiForm.leads_actual}   onChange={e => setKpiForm({ ...kpiForm, leads_actual:   e.target.value })} placeholder="Ex: 47" />
            <Input label="ROAS Real"      type="number" step="0.01" value={kpiForm.roas_actual} onChange={e => setKpiForm({ ...kpiForm, roas_actual:   e.target.value })} placeholder="Ex: 2.3" />
          </div>
          <Input label="Receita Gerada (R$)" type="number" step="0.01" value={kpiForm.revenue_actual} onChange={e => setKpiForm({ ...kpiForm, revenue_actual: e.target.value })} placeholder="Ex: 47000" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsKPIOpen(false)}>Cancelar</Button>
            <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Atualizar</Button>
          </div>
        </form>
      </Modal>

      {/* NOVA TAREFA */}
      <Modal isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title="Nova Tarefa">
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div className="p-3 bg-secondary/40 rounded-xl text-xs text-muted-foreground">
            Esta tarefa ficará vinculada à campanha e também aparecerá no painel global de Tarefas.
          </div>
          <Input label="Título *" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="Ex: Criar criativos para o anúncio" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Descrição (opcional)</label>
            <textarea
              className="w-full min-h-[70px] bg-secondary/50 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Prioridade</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Coluna</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                {TASK_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsTaskOpen(false)}>Cancelar</Button>
            <Button type="submit">Criar Tarefa</Button>
          </div>
        </form>
      </Modal>

      {/* ADICIONAR MEMBRO */}
      <Modal isOpen={isMemberOpen} onClose={() => setIsMemberOpen(false)} title="Adicionar Membro">
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <Input label="Nome *" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required placeholder="Ex: João Vitor" />
          <Input label="Função / Responsabilidade *" value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} required placeholder="Ex: Gestor de Tráfego" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsMemberOpen(false)}>Cancelar</Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
