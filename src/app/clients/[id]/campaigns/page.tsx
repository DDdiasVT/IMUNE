"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  Plus, Megaphone, ChevronRight, Users,
  Edit2, Trash2, Save, Target, TrendingUp, DollarSign,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; dotColor: string }> = {
  planning:     { label: "Planejamento", dotColor: "bg-slate-400" },
  production:   { label: "Produção",     dotColor: "bg-blue-500" },
  approval:     { label: "Aprovação",    dotColor: "bg-purple-500" },
  running:      { label: "Rodando",      dotColor: "bg-emerald-500" },
  optimization: { label: "Otimização",   dotColor: "bg-amber-500" },
  finished:     { label: "Finalizada",   dotColor: "bg-slate-600" },
};

const PLATFORMS  = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "YouTube Ads", "Orgânico"];
const OBJECTIVES = [
  "Geração de Leads", "Conversão", "Tráfego", "Lançamento",
  "Reconhecimento de Marca", "Vendas Diretas", "Retenção",
];

const EMPTY_FORM = {
  name: "", description: "", objective: "", platform: "Meta Ads",
  status: "planning", start_date: "", end_date: "",
  budget: "", goal_leads: "", goal_cpl: "", goal_roas: "", goal_revenue: "",
  manager_url: "",
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ClientCampaigns({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const router = useRouter();

  const [campaigns, setCampaigns]   = useState<any[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });

  useEffect(() => { fetchData(); }, [clientId]);

  const fetchData = async () => {
    try {
      const [campsRes, membersRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
        supabase.from("campaign_members").select("campaign_id"),
      ]);
      setCampaigns(campsRes.data || []);
      const counts: Record<string, number> = {};
      (membersRes.data || []).forEach((m: any) => {
        counts[m.campaign_id] = (counts[m.campaign_id] || 0) + 1;
      });
      setMemberCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (camp?: any) => {
    if (camp) {
      setEditing(camp);
      setForm({
        name: camp.name || "", description: camp.description || "",
        objective: camp.objective || "", platform: camp.platform || "Meta Ads",
        status: camp.status || "planning",
        start_date: camp.start_date || "", end_date: camp.end_date || "",
        budget: camp.budget?.toString() || "",
        goal_leads: camp.goal_leads?.toString() || "",
        goal_cpl: camp.goal_cpl?.toString() || "",
        goal_roas: camp.goal_roas?.toString() || "",
        goal_revenue: camp.goal_revenue?.toString() || "",
        manager_url: camp.manager_url || "",
      });
    } else {
      setEditing(null);
      setForm({ ...EMPTY_FORM });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      objective: form.objective || null,
      platform: form.platform,
      status: form.status,
      client_id: clientId,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: parseFloat(form.budget || "0"),
      goal_leads: parseInt(form.goal_leads || "0"),
      goal_cpl: parseFloat(form.goal_cpl || "0"),
      goal_roas: parseFloat(form.goal_roas || "0"),
      goal_revenue: parseFloat(form.goal_revenue || "0"),
      manager_url: form.manager_url || null,
    };
    if (editing) {
      await supabase.from("campaigns").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
    } else {
      await supabase.from("campaigns").insert(payload);
    }
    fetchData();
    closeModal();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Excluir esta campanha e todas as suas tarefas vinculadas?")) {
      await supabase.from("campaigns").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Campanhas</h3>
          <p className="text-sm text-muted-foreground">
            {campaigns.length} campanha{campaigns.length !== 1 ? "s" : ""} registrada{campaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" className="gap-2 w-full sm:w-auto justify-center" onClick={() => openModal()}>
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-2xl">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <p className="font-semibold text-muted-foreground mb-1">Nenhuma campanha cadastrada</p>
          <p className="text-sm text-muted-foreground mb-6">Crie a primeira campanha para este cliente.</p>
          <Button size="sm" className="gap-2" onClick={() => openModal()}>
            <Plus className="h-4 w-4" /> Nova Campanha
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((camp) => {
          const status     = STATUS_MAP[camp.status] || STATUS_MAP.planning;
          const spent      = camp.spent || 0;
          const spentPct   = camp.budget > 0 ? Math.min((spent / camp.budget) * 100, 100) : 0;
          const cplActual  = camp.leads_actual > 0 ? (spent / camp.leads_actual) : 0;

          return (
            <div
              key={camp.id}
              className="relative group cursor-pointer"
              onClick={() => router.push(`/clients/${clientId}/campaigns/${camp.id}`)}
            >
              <Card className="h-full hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-5 space-y-4">
                  {/* Top row: status + actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                        <span className="text-xs font-semibold">{status.label}</span>
                      </div>
                      {camp.platform && (
                        <Badge variant="secondary" className="text-[10px]">{camp.platform}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={e => { e.stopPropagation(); openModal(camp); }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={e => handleDelete(camp.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Name + objective + dates */}
                  <div>
                    <h4 className="font-bold text-base leading-snug">{camp.name}</h4>
                    {camp.objective && (
                      <p className="text-xs text-muted-foreground mt-0.5">{camp.objective}</p>
                    )}
                    {(camp.start_date || camp.end_date) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(camp.start_date) ?? "?"} → {formatDate(camp.end_date) ?? "?"}
                      </p>
                    )}
                  </div>

                  {/* Budget progress */}
                  {camp.budget > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                        <span>Investimento</span>
                        <span>R$ {spent.toLocaleString()} / R$ {camp.budget.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${spentPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* KPI chips */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-secondary/40 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Leads</p>
                      <p className="text-sm font-black mt-0.5">
                        {camp.leads_actual || 0}
                        {camp.goal_leads > 0 ? <span className="text-muted-foreground font-normal text-[10px]">/{camp.goal_leads}</span> : ""}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-secondary/40 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">CPL</p>
                      <p className="text-sm font-black mt-0.5">
                        {cplActual > 0 ? `R$${cplActual.toFixed(0)}` : "—"}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-secondary/40 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">ROAS</p>
                      <p className="text-sm font-black mt-0.5">
                        {camp.roas_actual > 0 ? `${camp.roas_actual}x` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    {(memberCounts[camp.id] || 0) > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {memberCounts[camp.id]} membro{memberCounts[camp.id] !== 1 ? "s" : ""}
                      </div>
                    ) : <div />}
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      Ver detalhes <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editing ? "Editar Campanha" : "Nova Campanha"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nome da Campanha *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Ex: Campanha de Leads — Jan 2025"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Descrição</label>
            <textarea
              className="w-full min-h-[80px] bg-secondary/50 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Contexto, estratégia e proposta desta campanha..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Objetivo</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={form.objective}
                onChange={e => setForm({ ...form, objective: e.target.value })}
              >
                <option value="">Selecione...</option>
                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Plataforma</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data de Início" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Data de Término"  type="date" value={form.end_date}   onChange={e => setForm({ ...form, end_date:   e.target.value })} />
          </div>

          <Input
            label="Verba Estimada (R$)"
            type="number"
            value={form.budget}
            onChange={e => setForm({ ...form, budget: e.target.value })}
            placeholder="Ex: 5000"
          />

          {/* Goals section */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Metas de Performance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Meta de Leads"     type="number"          value={form.goal_leads}   onChange={e => setForm({ ...form, goal_leads:   e.target.value })} placeholder="Ex: 100" />
              <Input label="CPL Alvo (R$)"     type="number"          value={form.goal_cpl}     onChange={e => setForm({ ...form, goal_cpl:     e.target.value })} placeholder="Ex: 80" />
              <Input label="ROAS Alvo"         type="number" step="0.1" value={form.goal_roas}  onChange={e => setForm({ ...form, goal_roas:    e.target.value })} placeholder="Ex: 3" />
              <Input label="Meta de Receita (R$)" type="number"       value={form.goal_revenue} onChange={e => setForm({ ...form, goal_revenue: e.target.value })} placeholder="Ex: 50000" />
            </div>
          </div>

          <Input
            label="URL do Gerenciador de Anúncios (opcional)"
            type="url"
            value={form.manager_url}
            onChange={e => setForm({ ...form, manager_url: e.target.value })}
            placeholder="https://business.facebook.com/..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {editing ? "Salvar Alterações" : "Criar Campanha"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
