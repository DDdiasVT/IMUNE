"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, ChevronRight, FileText, Star, FolderOpen, Plus, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";

export type WikiArticle = {
  id: string;
  title: string;
  content: string;
  category: 'positioning' | 'avatar' | 'tone_of_voice' | 'scripts' | 'objections' | 'copy' | 'references';
  created_at?: string;
  updated_at?: string;
};

export default function WikiPage() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "positioning" as WikiArticle['category']
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase.from('wiki_articles').select('*').order('created_at', { ascending: false });
      setArticles(data || []);
    } catch (err) {
      console.error("Error fetching wiki articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await supabase.from('wiki_articles').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', editingArticle.id);
      } else {
        await supabase.from('wiki_articles').insert(formData);
      }
      fetchArticles();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar artigo.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir artigo?")) {
      try {
        await supabase.from('wiki_articles').delete().eq('id', id);
        fetchArticles();
      } catch (err) {
        console.error("Error deleting article:", err);
      }
    }
  };

  const openModal = (article?: WikiArticle) => {
    if (article) {
      setEditingArticle(article);
      setFormData({ title: article.title, content: article.content, category: article.category });
    } else {
      setEditingArticle(null);
      setFormData({ title: "", content: "", category: "positioning" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const filtered = articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h2>
          <p className="text-muted-foreground">Documentação interna, processos e ativos da agência.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Novo Artigo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Pesquisar na wiki..." 
          className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl shadow-sm text-lg outline-none focus:ring-2 focus:ring-primary/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold px-1">Artigos</h3>
          {filtered.map((art) => (
            <div key={art.id} className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-secondary/30 transition-colors group">
              <div className="flex items-center gap-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{art.title}</p>
                  <p className="text-xs text-muted-foreground uppercase">{art.category}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(art)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(art.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingArticle ? "Editar Artigo" : "Novo Artigo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título do Artigo" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Categoria</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
            >
              <option value="positioning">Posicionamento</option>
              <option value="avatar">Avatar / Persona</option>
              <option value="tone_of_voice">Tom de Voz</option>
              <option value="scripts">Scripts</option>
              <option value="objections">Objeções</option>
              <option value="copy">Copies</option>
              <option value="references">Referências</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Conteúdo (Markdown)</label>
            <textarea 
              className="flex min-h-[200px] w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Artigo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
