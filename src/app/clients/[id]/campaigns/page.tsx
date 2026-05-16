"use client";

import { Plus, Megaphone, MoreHorizontal, ArrowUpRight, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const campaigns = [
  { 
    id: 1, 
    name: "Captação Workshop", 
    status: "running", 
    objective: "Leads (WhatsApp)",
    metrics: { spent: "R$ 1.200", leads: 42, cpl: "R$ 28,50", roas: "N/A" }
  },
  { 
    id: 2, 
    name: "Branding Outubro", 
    status: "optimization", 
    objective: "Alcance",
    metrics: { spent: "R$ 450", reach: "12k", cpm: "R$ 12,00", roas: "N/A" }
  },
];

export default function ClientCampaigns() {
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
              <div className="grid grid-cols-2 divide-x divide-y border-b">
                {Object.entries(camp.metrics).map(([key, val], idx) => (
                  <div key={idx} className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{key}</p>
                    <p className="text-sm font-bold mt-1">{val}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Target className="h-4 w-4 text-muted-foreground" />
                   <span className="text-xs text-muted-foreground">Última atualização: Hoje, 09:30</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                  Ver Gerenciador
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
