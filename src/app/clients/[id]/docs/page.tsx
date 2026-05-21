"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Plus, FileText, Trash2, Edit2, Search,
  BookOpen, ClipboardList, Megaphone, Users,
  FileCheck, StickyNote, ChevronRight, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const DOC_TYPES = [
  { id: "briefing",   label: "Briefing",       icon: ClipboardList, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "summary",    label: "Resumo",          icon: FileCheck,     color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { id: "meeting",    label: "Ata de Reunião",  icon: Users,         color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { id: "script",     label: "Roteiro",         icon: BookOpen,      color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { id: "report",     label: "Relatório",       icon: FileText,      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { id: "comms",      label: "Comunicado",      icon: Megaphone,     color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { id: "note",       label: "Nota Interna",    icon: StickyNote,    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
];

type Doc = {
  id: string;
  title: string;
  type: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

const emptyForm = { title: "", type: "briefing", content: "" };

export default function ClientDocsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const { profile } = useAuth();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [viewing, setViewing] = useState<Doc | null>(null);

  useEffect(() => { fetchDocs(); }, [clientId]);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", clientId)
      .order("updated_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsEditorOpen(true);
  };

  const openEdit = (doc: Doc) => {
    setEditing(doc);
    setForm({ title: doc.title, type: doc.type, content: doc.content || "" });
    setViewing(null);
    setIsEditorOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      client_id: clientId,
      title: form.title,
      type: form.type,
      content: form.content,
      created_by: profile?.id,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from("documents").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("documents").insert(payload);
    }
    await fetchDocs();
    setIsEditorOpen(false);
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir documento?")) return;
    await supabase.from("documents").delete().eq("id", id);
    setDocs(prev => prev.filter(d => d.id !== id));
    if (viewing?.id === id) setViewing(null);
  };

  const getType = (id: string) => DOC_TYPES.find(t => t.id === id) ?? DOC_TYPES[DOC_TYPES.length - 1];

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? d.type === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Documentação</h3>
          <p className="text-sm text-muted-foreground">Briefings, resumos, atas e toda comunicação do cliente.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo Documento
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 bg-secondary/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${!filterType ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
          >
            Todos
          </button>
          {DOC_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(filterType === t.id ? null : t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${filterType === t.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de documentos */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-xs uppercase tracking-widest animate-pulse">
          Carregando documentos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground text-sm">Nenhum documento encontrado.</p>
          <Button variant="ghost" className="mt-4 gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Criar primeiro documento
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(doc => {
            const type = getType(doc.type);
            const TypeIcon = type.icon;
            return (
              <Card
                key={doc.id}
                className="hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => setViewing(doc)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 ${type.color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm truncate">{doc.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${type.color} shrink-0`}>
                        {type.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true, locale: ptBR })}
                      {doc.content && (
                        <span className="truncate max-w-[300px] hidden sm:block">
                          · {doc.content.slice(0, 80)}{doc.content.length > 80 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={e => { e.stopPropagation(); openEdit(doc); }}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={e => { e.stopPropagation(); remove(doc.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de visualização */}
      {viewing && (
        <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing.title}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(() => {
                const type = getType(viewing.type);
                return (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${type.color}`}>
                    {type.label}
                  </span>
                );
              })()}
              <span className="text-xs text-muted-foreground">
                Atualizado {formatDistanceToNow(new Date(viewing.updated_at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            <div className="bg-secondary/30 rounded-xl border border-border/50 p-4 min-h-[200px] max-h-[60vh] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {viewing.content || <span className="text-muted-foreground italic">Sem conteúdo.</span>}
              </pre>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setViewing(null)}>Fechar</Button>
              <Button className="gap-2" onClick={() => openEdit(viewing)}>
                <Edit2 className="h-4 w-4" /> Editar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de criação/edição */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editing ? "Editar Documento" : "Novo Documento"}
      >
        <div className="space-y-4">
          <Input
            label="Título"
            placeholder="Ex: Briefing Inicial — Campanha de Lançamento"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map(t => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t.id }))}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all text-left ${
                      form.type === t.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <TIcon className="h-4 w-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Conteúdo</label>
            <textarea
              className="w-full min-h-[240px] bg-secondary/50 border border-input rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-y font-mono leading-relaxed"
              placeholder="Escreva o conteúdo do documento aqui..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()}>
              {saving ? "Salvando..." : "Salvar Documento"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
