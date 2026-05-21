"use client";

import React, { useState, useEffect } from "react";
import { Info, FileText, Lock, User, Calendar, ExternalLink, Plus, Save, Trash2, Globe, Link as LinkIcon, Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";

export default function ClientInfo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [client, setClient] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  
  const [newAsset, setNewAsset] = useState({ label: "", url: "", category: "link" });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [clientRes, assetsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('client_assets').select('*').eq('client_id', id).order('created_at', { ascending: false })
    ]);
    
    setClient(clientRes.data);
    setAssets(assetsRes.data || []);
    setLoading(false);
  };

  const handleUpdate = async () => {
    await supabase.from('clients').update(client).eq('id', id);
    setIsEditing(false);
    fetchData();
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('client_assets').insert({ ...newAsset, client_id: id });
    setIsAssetModalOpen(false);
    setNewAsset({ label: "", url: "", category: "link" });
    fetchData();
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm("Remover este link?")) {
      await supabase.from('client_assets').delete().eq('id', assetId);
      fetchData();
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando dados...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Dados Gerais */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Perfil Estratégico
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Nicho / Setor</p>
              {isEditing ? (
                <input className="w-full bg-secondary/50 border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary" value={client?.niche || ""} onChange={e => setClient({...client, niche: e.target.value})} />
              ) : (
                <p className="text-sm font-medium">{client?.niche || "Não definido"}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
              <p className="text-sm font-medium text-emerald-500 capitalize">{client?.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Responsável</p>
              <p className="text-sm font-medium">{client?.responsible_id || "Joao Vitor"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Desde</p>
              <p className="text-sm font-medium">{new Date(client?.created_at).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Modelo de Cobrança</p>
              {isEditing ? (
                <select 
                  className="w-full bg-secondary/50 border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary" 
                  value={client?.billing_model || "fixed"} 
                  onChange={e => setClient({...client, billing_model: e.target.value})}
                >
                  <option value="fixed">Fixo (Fee)</option>
                  <option value="partnership">Sociedade (%)</option>
                </select>
              ) : (
                <p className="text-sm font-medium">{client?.billing_model === 'partnership' ? `Sociedade (${client?.partnership_percentage}%)` : "Fixo (Fee)"}</p>
              )}
            </div>
            {isEditing && client?.billing_model === 'partnership' && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">% da Agência</p>
                <input 
                  type="number"
                  className="w-full bg-secondary/50 border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary" 
                  value={client?.partnership_percentage || 50} 
                  onChange={e => setClient({...client, partnership_percentage: e.target.value})} 
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/50 space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Breve Briefing / Observações</p>
            {isEditing ? (
              <textarea className="w-full bg-secondary/50 border rounded px-2 py-2 text-sm min-h-[100px] outline-none focus:ring-1 focus:ring-primary" value={client?.notes || ""} onChange={e => setClient({...client, notes: e.target.value})} />
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">{client?.notes || "Sem observações cadastradas."}</p>
            )}
          </div>

          {isEditing && (
            <Button className="w-full mt-4 gap-2" onClick={handleUpdate}>
              <Save className="h-4 w-4" /> Salvar Alterações
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Ativos e Documentos */}
      <div className="space-y-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Documentos & Links
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsAssetModalOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {assets.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                Nenhum documento ou link cadastrado.
              </p>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-secondary/20 transition-all group">
                    <a href={asset.url} target="_blank" className="flex items-center gap-3 flex-1">
                      <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                        {asset.category === 'image' ? <ImageIcon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{asset.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{asset.url}</p>
                      </div>
                    </a>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteAsset(asset.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full border-dashed gap-2" onClick={() => setIsAssetModalOpen(true)}>
              <Plus className="h-4 w-4" /> Adicionar Novo Link
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Novo Asset */}
      <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title="Adicionar Documento / Link">
        <form onSubmit={handleAddAsset} className="space-y-4">
          <Input label="Título (ex: Pasta Google Drive)" value={newAsset.label} onChange={e => setNewAsset({...newAsset, label: e.target.value})} required />
          <Input label="URL do Link" value={newAsset.url} onChange={e => setNewAsset({...newAsset, url: e.target.value})} placeholder="https://..." required />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Categoria</label>
            <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
              <option value="link">Link Geral</option>
              <option value="doc">Documento / PDF</option>
              <option value="image">Imagem / Branding</option>
              <option value="video">Vídeo / Referência</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAssetModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Adicionar Ativo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
