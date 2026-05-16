"use client";

import { Plus, Megaphone, MoreHorizontal, ArrowUpRight, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ClientCampaigns({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, [clientId]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Campanhas de Tráfego</h3>
          <p className="text-sm text-muted-foreground">Monitoramento em tempo real de anúncios e investimentos.</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="overflow-hidden border-border/50">
            <CardHeader className="bg-secondary/20 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={camp.status === 'running' ? 'success' : 'secondary'}>
                    {camp.status === 'running' ? 'Ativa' : 'Otimizando'}
                  </Badge>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{camp.objective}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg mt-2">{camp.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b">
                <div className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Investido</p>
                  <p className="text-sm font-bold mt-1">R$ {camp.spent?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Leads</p>
                  <p className="text-sm font-bold mt-1">{camp.leads || 0}</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">CPL</p>
                  <p className="text-sm font-bold mt-1">R$ {camp.cpl?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">ROAS</p>
                  <p className="text-sm font-bold mt-1">{camp.roas || '0'}x</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Target className="h-4 w-4 text-muted-foreground" />
                   <span className="text-xs text-muted-foreground">Sincronizado com Gerenciador</span>
                </div>
                {camp.manager_url && (
                  <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={() => window.open(camp.manager_url, '_blank')}>
                    Ver Gerenciador
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-secondary/10 rounded-xl border-2 border-dashed border-border/50">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Nenhuma campanha cadastrada para este cliente.</p>
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Criar Primeira Campanha
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
