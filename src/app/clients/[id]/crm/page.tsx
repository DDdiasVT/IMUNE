"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { KanbanBoard, PipelineStage, DEFAULT_STAGES } from "@/components/crm/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { Settings2, Plus, Trash2, GripVertical } from "lucide-react";

const COLORS = [
  "#3b82f6", "#f59e0b", "#a855f7", "#6366f1",
  "#10b981", "#ef4444", "#f97316", "#06b6d4",
  "#84cc16", "#ec4899",
];

export default function ClientCrmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const { isAdmin, profile } = useAuth();

  const canEdit = isAdmin || profile?.role === "member";

  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editStages, setEditStages] = useState<PipelineStage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPipeline();
  }, [clientId]);

  const loadPipeline = async () => {
    const { data } = await supabase.from("clients").select("pipeline").eq("id", clientId).single();
    if (data?.pipeline && Array.isArray(data.pipeline) && data.pipeline.length > 0) {
      setStages(data.pipeline);
    } else {
      setStages(DEFAULT_STAGES);
    }
  };

  const openEditor = () => {
    setEditStages(stages.map(s => ({ ...s })));
    setIsEditorOpen(true);
  };

  const addStage = () => {
    const newStage: PipelineStage = {
      id: `stage_${Date.now()}`,
      name: "Nova Etapa",
      color: COLORS[editStages.length % COLORS.length],
    };
    setEditStages(prev => [...prev, newStage]);
  };

  const removeStage = (id: string) => {
    setEditStages(prev => prev.filter(s => s.id !== id));
  };

  const updateStage = (id: string, field: keyof PipelineStage, value: string) => {
    setEditStages(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveStages = async () => {
    if (editStages.length < 2) {
      alert("O funil precisa ter ao menos 2 etapas.");
      return;
    }
    setSaving(true);
    await supabase.from("clients").update({ pipeline: editStages }).eq("id", clientId);
    setStages(editStages);
    setIsEditorOpen(false);
    setSaving(false);
  };

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col gap-4">
      {canEdit && (
        <div className="flex justify-end shrink-0">
          <Button variant="outline" className="gap-2" onClick={openEditor}>
            <Settings2 className="h-4 w-4" />
            Editar Funil
          </Button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard clientId={clientId} stages={stages} />
      </div>

      <Modal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title="Configurar Funil do Cliente">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {editStages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="color"
                value={stage.color}
                onChange={(e) => updateStage(stage.id, "color", e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                title="Cor da etapa"
              />
              <input
                type="text"
                value={stage.name}
                onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                className="flex-1 h-9 bg-background border border-input rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nome da etapa"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive shrink-0"
                onClick={() => removeStage(stage.id)}
                disabled={editStages.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="w-full mt-3 gap-2 border border-dashed border-border" onClick={addStage}>
          <Plus className="h-4 w-4" /> Adicionar Etapa
        </Button>

        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border/50">
          <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
          <Button onClick={saveStages} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Funil"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
