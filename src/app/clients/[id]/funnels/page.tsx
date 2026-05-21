"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, TrendingDown, ChevronRight, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

type FunnelStage = {
  id: string;
  name: string;
  count: number;
  color: string;
};

type Funnel = {
  id: string;
  client_id: string;
  name: string;
  type: string;
  description: string;
  stages: FunnelStage[];
  created_at: string;
};

const STAGE_COLORS = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

const FUNNEL_TYPES = [
  { value: "quiz", label: "Quiz" },
  { value: "webinar", label: "Webinário" },
  { value: "vsl", label: "VSL (Vídeo de Vendas)" },
  { value: "lancamento", label: "Lançamento" },
  { value: "isca", label: "Isca Digital" },
  { value: "direto", label: "Oferta Direta" },
  { value: "custom", label: "Personalizado" },
];

function FunnelVisual({ stages }: { stages: FunnelStage[] }) {
  if (!stages.length) return null;
  const total = stages[0]?.count || 1;

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
        const convPct = i > 0 && stages[i - 1].count > 0
          ? Math.round((stage.count / stages[i - 1].count) * 100)
          : null;

        return (
          <div key={stage.id} className="space-y-1">
            {i > 0 && (
              <div className="flex items-center gap-2 pl-4">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">
                  {convPct}% converteram desta etapa
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{pct}% do topo</span>
                    <span className="text-sm font-bold tabular-nums">
                      {stage.count.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
                <div className="h-8 rounded-md overflow-hidden bg-secondary/30">
                  <div
                    className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${Math.max(pct, 4)}%`,
                      backgroundColor: stage.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {stages.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Conversão Total</p>
            <p className="text-xl font-bold text-primary">
              {stages[0].count > 0
                ? Math.round((stages[stages.length - 1].count / stages[0].count) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Entradas</p>
            <p className="text-xl font-bold">{stages[0].count.toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Saídas (último)</p>
            <p className="text-xl font-bold text-emerald-500">
              {stages[stages.length - 1].count.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function newStage(index: number): FunnelStage {
  return {
    id: crypto.randomUUID(),
    name: "",
    count: 0,
    color: STAGE_COLORS[index % STAGE_COLORS.length],
  };
}

export default function ClientFunnels({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingFunnel, setViewingFunnel] = useState<Funnel | null>(null);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("custom");
  const [formDescription, setFormDescription] = useState("");
  const [formStages, setFormStages] = useState<FunnelStage[]>([newStage(0), newStage(1)]);

  useEffect(() => { fetchFunnels(); }, [clientId]);

  const fetchFunnels = async () => {
    try {
      const { data, error } = await supabase
        .from("funnels")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFunnels(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingFunnel(null);
    setFormName("");
    setFormType("custom");
    setFormDescription("");
    setFormStages([newStage(0), newStage(1), newStage(2)]);
    setIsModalOpen(true);
  };

  const openEdit = (funnel: Funnel) => {
    setViewingFunnel(null);
    setEditingFunnel(funnel);
    setFormName(funnel.name);
    setFormType(funnel.type);
    setFormDescription(funnel.description || "");
    setFormStages(funnel.stages.length ? funnel.stages : [newStage(0), newStage(1)]);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingFunnel(null); };

  const handleSave = async () => {
    if (!formName.trim()) return alert("Dê um nome ao funil.");
    const validStages = formStages.filter((s) => s.name.trim());
    if (validStages.length < 2) return alert("Adicione pelo menos 2 etapas com nome.");

    try {
      const payload = {
        client_id: clientId,
        name: formName.trim(),
        type: formType,
        description: formDescription.trim(),
        stages: validStages,
        updated_at: new Date().toISOString(),
      };

      if (editingFunnel) {
        await supabase.from("funnels").update(payload).eq("id", editingFunnel.id);
      } else {
        await supabase.from("funnels").insert(payload);
      }
      fetchFunnels();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar funil.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este funil?")) return;
    await supabase.from("funnels").delete().eq("id", id);
    fetchFunnels();
    if (viewingFunnel?.id === id) setViewingFunnel(null);
  };

  const addStage = () => setFormStages((prev) => [...prev, newStage(prev.length)]);

  const removeStage = (id: string) =>
    setFormStages((prev) => prev.filter((s) => s.id !== id));

  const updateStage = (id: string, field: keyof FunnelStage, value: string | number) =>
    setFormStages((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const totalConversion = (funnel: Funnel) => {
    if (!funnel.stages.length || funnel.stages[0].count === 0) return 0;
    return Math.round((funnel.stages[funnel.stages.length - 1].count / funnel.stages[0].count) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Funis de Conversão</h3>
          <p className="text-sm text-muted-foreground">Visualize e meça cada etapa do funil.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo Funil
        </Button>
      </div>

      {/* Lista de funis */}
      {funnels.length === 0 && !loading ? (
        <div className="py-20 text-center bg-secondary/10 rounded-xl border-2 border-dashed border-border/50">
          <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <p className="text-muted-foreground mb-4">Nenhum funil cadastrado ainda.</p>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Criar primeiro funil
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funnels.map((funnel) => (
            <Card
              key={funnel.id}
              className="p-5 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setViewingFunnel(funnel)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">
                    {FUNNEL_TYPES.find((t) => t.value === funnel.type)?.label || funnel.type}
                  </p>
                  <h4 className="font-bold text-base">{funnel.name}</h4>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(funnel)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(funnel.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Mini funil visual */}
              {funnel.stages.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  {funnel.stages.map((stage, i) => {
                    const pct = funnel.stages[0].count > 0
                      ? Math.round((stage.count / funnel.stages[0].count) * 100)
                      : 0;
                    return (
                      <div key={stage.id} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground w-28 truncate shrink-0">{stage.name}</span>
                        <div className="flex-1 h-4 rounded bg-secondary/30 overflow-hidden">
                          <div
                            className="h-full rounded transition-all"
                            style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: stage.color, opacity: 0.8 }}
                          />
                        </div>
                        <span className="text-[11px] font-bold tabular-nums w-14 text-right shrink-0">
                          {stage.count.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{funnel.stages.length} etapas</span>
                <span className="text-sm font-bold text-primary">{totalConversion(funnel)}% conversão total</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de visualização */}
      {viewingFunnel && (
        <Modal isOpen={!!viewingFunnel} onClose={() => setViewingFunnel(null)} title={viewingFunnel.name}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                {FUNNEL_TYPES.find((t) => t.value === viewingFunnel.type)?.label}
              </span>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(viewingFunnel)}>
                <Edit2 className="h-3.5 w-3.5" /> Editar
              </Button>
            </div>
            {viewingFunnel.description && (
              <p className="text-sm text-muted-foreground">{viewingFunnel.description}</p>
            )}
            <FunnelVisual stages={viewingFunnel.stages} />
          </div>
        </Modal>
      )}

      {/* Modal de criação/edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingFunnel ? "Editar Funil" : "Novo Funil"}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome do Funil"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="col-span-2"
            />
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Tipo de Funil</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                {FUNNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Descrição (opcional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="col-span-2"
            />
          </div>

          {/* Stage builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Etapas do Funil</label>
              <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={addStage}>
                <Plus className="h-3 w-3" /> Adicionar etapa
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {formStages.map((stage, i) => (
                <div key={stage.id} className="flex items-center gap-2 group">
                  <div
                    className="h-4 w-4 rounded-full shrink-0 cursor-pointer border-2 border-white/20"
                    style={{ backgroundColor: stage.color }}
                    onClick={() => {
                      const next = STAGE_COLORS[(STAGE_COLORS.indexOf(stage.color) + 1) % STAGE_COLORS.length];
                      updateStage(stage.id, "color", next);
                    }}
                    title="Clique para mudar a cor"
                  />
                  <input
                    className="flex-1 h-9 rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={`Etapa ${i + 1} (ex: Visitantes)`}
                    value={stage.name}
                    onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                  />
                  <input
                    className="w-24 h-9 rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={stage.count || ""}
                    onChange={(e) => updateStage(stage.id, "count", parseInt(e.target.value) || 0)}
                  />
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => removeStage(stage.id)}
                    disabled={formStages.length <= 2}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview inline */}
          {formStages.some((s) => s.name && s.count > 0) && (
            <div className="border border-border/50 rounded-xl p-4 bg-secondary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-3">Preview</p>
              <FunnelVisual stages={formStages.filter((s) => s.name.trim())} />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar Funil</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
