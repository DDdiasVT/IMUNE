"use client";

import { useState, useEffect } from "react";
import { Plus, Megaphone, ChevronRight, Edit2, Trash2, Save, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";
import { Client } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const STATUS_MAP: Record<string, { label: string; dotColor: string }> = {
  planning:     { label: "Planejamento", dotColor: "bg-slate-400" },
  production:   { label: "Produção",     dotColor: "bg-blue-500" },
  approval:     { label: "Aprovação",    dotColor: "bg-purple-500" },
  running:      { label: "Rodando",      dotColor: "bg-emerald-500" },
  optimization: { label: "Otimização",   dotColor: "bg-amber-500" },
  finished:     { label: "Finalizada",   dotColor: "bg-slate-600" },
};

const ALL_STATUSES = Object.entries(STATUS_MAP).map(([id, v]) => ({ id, ...v }));
const PLATFORMS    = ["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "YouTube Ads", "Orgânico"];
const OBJECTIVES   = [
  "Geração de Leads", "Conversão", "Tráfego", "Lançamento",
  "Reconhecimento de Marca", "Vendas Diretas", "Retenção",
];

const EMPTY_FORM = {
  name: "", client_id: "", description: "", objective: "",
  budget: "", status: "planning", platform: "Meta Ads",
  start_date: "", end_date: "", goal_leads: "", goal_cpl: "",
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function CampaignsPage() {
  const { profile, isClient } = useAuth();
  const router = useRouter();

  const [campaigns,  setCampaigns]  = useState<any[]>([]);
  const [clients,    setClients]    = useState<Client[]>([]);
  const [filter,     setFilter]     = useState<string>("all");
  const [loading,    setLoading]    = useState(true);
  const [isModalOpen,setIsModalOpen]= useState(false);
  const [editing,    setEditing]    = useState<any>(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });

  useEffect(() => { fetchData(); }, [isClient, profile]);

  const fetchData = async () => {
    try {
      let q = supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (isClient && profile?.client_id) q = q.eq("client_id", profile.client_id);
      const { data: camps } = await q;
      setCampaigns(camps || []);
      if (!isClient) {
        const clientsData = await db.clients.list();
        setClients(clientsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (camp?: any) => {
    const defaultClientId = isClient ? (profile?.client_id ?? "") : "";
    if (camp) {
      setEditing(camp);
      setForm({
        name: camp.name || "", client_id: camp.client_id || defaultClientId,
        description: camp.description || "", objective: camp.objective || "",
        budget: camp.budget?.toString() || "", status: camp.status || "planning",
        platform: camp.platform || "Meta Ads",
        start_date: camp.start_date || "", end_date: camp.end_date || "",
        goal_leads: camp.goal_leads?.toString() || "",
        goal_cpl:   camp.goal_cpl?.toString()   || "",
      });
    } else {
      setEditing(null);
      setForm({ ...EMPTY_FORM, client_id: defaultClientId });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      client_id: form.client_id || null,
      description: form.description || null,
      objective:   form.objective   || null,
      platform:    form.platform,
      status:      form.status,
      budget:     parseFloat(form.budget     || "0"),
      goal_leads: parseInt(form.goal_leads   || "0"),
      goal_cpl:   parseFloat(form.goal_cpl   || "0"),
      start_date: form.start_date || null,
      end_date:   form.end_date   || null,
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
    if (confirm("Excluir esta campanha?")) {
      await supabase.from("campaigns").delete().eq("id", id);
      fetchData();
    }
  };

  const handleCardClick = (camp: any) => {
    if (camp.client_id) {
      router.push(`/clients/${camp.client_id}/campaigns/${camp.id}`);
    }
    // IMUNE internal campaigns: open edit modal for now
    else openModal(camp);
  };

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Campanhas</h2>
          <p className="text-muted-foreground text-sm">
            {campaigns.length} campanha{campaigns.length !== 1 ? "s" : ""} registrada{campaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" className="gap-2 w-full sm:w-auto justify-center" onClick={() => openModal()}>
          <Plus className="h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      {/* Status filter bar */}
      <div className="relative">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setFilter("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({campaigns.length})
          </button>
          {ALL_STATUSES.map(s => {
            const count = campaigns.filter(c => c.status === s.id).length;
            if (count === 0) return null;
            return (
              <button
                key={s.id}
                onClick={() => setFilter(s.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === s.id
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${s.dotColor}`} />
                {s.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-2xl">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <p className="font-semibold text-muted-foreground mb-1">
            {filter === "all" ? "Nenhuma campanha cadastrada" : `Nenhuma campanha em "${STATUS_MAP[filter]?.label}"`}
          </p>
          <Button size="sm" className="gap-2 mt-6" onClick={() => openModal()}>
            <Plus className="h-4 w-4" /> Nova Campanha
          </Button>
        </div>
      )}

      {/* Campaign grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((camp) => {
            const status    = STATUS_MAP[camp.status] || STATUS_MAP.planning;
            const client    = clientMap[camp.client_id];
            const spent     = camp.spent || 0;
            const spentPct  = camp.budget > 0 ? Math.min((spent / camp.budget) * 100, 100) : 0;
            const cplActual = (camp.leads_actual || 0) > 0 ? (spent / camp.leads_actual) : 0;
            const isClickable = !!camp.client_id;

            return (
              <div
                key={camp.id}
                className={`group relative ${isClickable ? "cursor-pointer" : ""}`}
                onClick={() => handleCardClick(camp)}
              >
                <Card className={`h-full transition-all ${isClickable ? "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5" : "opacity-80"}`}>
                  <CardContent className="p-5 space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                          <span className="text-xs font-semibold">{status.label}</span>
                          {camp.platform && (
                            <Badge variant="secondary" className="text-[10px]">{camp.platform}</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-primary font-bold">
                          {client?.name || "IMUNE (Interno)"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={e => { e.stopPropagation(); openModal(camp); }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={e => handleDelete(camp.id, e)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Name + dates */}
                    <div>
                      <h4 className="font-bold text-base leading-snug">{camp.name}</h4>
                      {camp.objective && <p className="text-xs text-muted-foreground mt-0.5">{camp.objective}</p>}
                      {(camp.start_date || camp.end_date) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(camp.start_date) ?? "?"} → {formatDate(camp.end_date) ?? "?"}
                        </p>
                      )}
                    </div>

                    {/* Budget bar */}
                    {camp.budget > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase">
                          <span>Investimento</span>
                          <span>R$ {spent.toLocaleString()} / R$ {camp.budget.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${spentPct}%` }} />
                        </div>
                      </div>
                    )}

                    {/* KPI chips */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Leads",   value: camp.leads_actual > 0 ? `${camp.leads_actual}${camp.goal_leads > 0 ? `/${camp.goal_leads}` : ""}` : "—" },
                        { label: "CPL",     value: cplActual > 0 ? `R$${cplActual.toFixed(0)}` : "—" },
                        { label: "ROAS",    value: camp.roas_actual > 0 ? `${camp.roas_actual}x` : "—" },
                      ].map(kpi => (
                        <div key={kpi.label} className="text-center p-2 bg-secondary/40 rounded-lg">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{kpi.label}</p>
                          <p className="text-sm font-black mt-0.5">{kpi.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div />
                      {isClickable ? (
                        <span className="text-xs text-primary font-bold flex items-center gap-1">
                          Ver campanha <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Campanha interna</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editing ? "Editar Campanha" : "Nova Campanha"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Campanha de Leads — Jan 2025" />

          {!isClient && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                <option value="">🏢 Agência IMUNE (Interno)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Objetivo</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })}>
                <option value="">Selecione...</option>
                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Plataforma</label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Data de Início"   type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Data de Término"  type="date" value={form.end_date}   onChange={e => setForm({ ...form, end_date:   e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Verba Estimada (R$)" type="number" value={form.budget}     onChange={e => setForm({ ...form, budget:     e.target.value })} />
            <Input label="Meta de Leads"       type="number" value={form.goal_leads} onChange={e => setForm({ ...form, goal_leads: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {editing ? "Salvar" : "Criar Campanha"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
