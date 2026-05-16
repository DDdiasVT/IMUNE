"use client";

import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  MousePointer2, 
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const performanceData = [
  { name: "Jan", leads: 45, investment: 1200 },
  { name: "Fev", leads: 52, investment: 1500 },
  { name: "Mar", leads: 48, investment: 1400 },
  { name: "Abr", leads: 61, investment: 1800 },
  { name: "Mai", leads: 75, investment: 2100 },
];

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ClientOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const [stats, setStats] = useState({
    leads: 0,
    spent: 0,
    cpl: 0,
    roas: 0
  });
  const [funnel, setFunnel] = useState<any[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, [clientId]);

  const fetchOverviewData = async () => {
    try {
      const [campaignsRes, leadsRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('client_id', clientId),
        supabase.from('leads').select('*').eq('client_id', clientId)
      ]);

      const camps = campaignsRes.data || [];
      const leads = leadsRes.data || [];

      const totalSpent = camps.reduce((acc, curr) => acc + (Number(curr.spent) || 0), 0);
      const totalLeads = leads.length;
      const avgCpl = totalLeads > 0 ? totalSpent / totalLeads : 0;

      setStats({
        leads: totalLeads,
        spent: totalSpent,
        cpl: avgCpl,
        roas: camps.reduce((acc, curr) => acc + (Number(curr.roas) || 0), 0) / (camps.length || 1)
      });

      // Funil baseado nos status dos leads
      const stages = [
        { label: "Leads Totais", status: "new_lead", color: "bg-blue-500" },
        { label: "Qualificados", status: "qualified", color: "bg-purple-500" },
        { label: "Agendados", status: "scheduled", color: "bg-indigo-500" },
        { label: "Fechados", status: "closed", color: "bg-emerald-500" }
      ];

      const funnelData = stages.map(stage => {
        const count = leads.filter(l => l.status === stage.status || (stage.status === 'new_lead' && l.status !== 'lost')).length;
        return {
          label: stage.label,
          value: count,
          percent: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
          color: stage.color
        };
      });

      setFunnel(funnelData);
      setActiveCampaigns(camps.filter(c => c.status === 'running'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Total", leads: stats.leads, investment: stats.spent }
  ];

  if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground uppercase tracking-widest text-xs">Sincronizando dados estratégicos...</div>;

  return (
    <div className="space-y-8">
      {/* Resumo Executivo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Investimento Total", value: `R$ ${stats.spent.toLocaleString()}`, icon: DollarSign, positive: false },
          { label: "Leads Gerados", value: stats.leads, icon: MessageSquare, positive: true },
          { label: "CPL Médio", value: `R$ ${stats.cpl.toLocaleString()}`, icon: Target, positive: true },
          { label: "ROAS Médio", value: `${stats.roas.toFixed(1)}x`, icon: TrendingUp, positive: true },
        ].map((stat, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-tighter opacity-70">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de Crescimento */}
        <Card className="col-span-full lg:col-span-4 h-[350px]">
          <CardHeader>
            <CardTitle className="text-base">Métricas Consolidadas</CardTitle>
          </CardHeader>
          <CardContent className="h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="leads" stroke="var(--primary)" fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funil Comercial */}
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Funil de Vendas Reais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {funnel.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.value} <span className="text-xs font-normal text-muted-foreground">({item.percent}%)</span></span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Resumo de Campanhas Ativas */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-base">Campanhas Ativas no Momento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {activeCampaigns.map((camp, i) => (
                <div key={i} className="p-4 border rounded-xl bg-secondary/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-primary">{camp.objective}</span>
                      <Badge variant="success" className="text-[9px]">ATIVO</Badge>
                    </div>
                    <p className="font-bold text-sm truncate">{camp.name}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground">
                      <p>LEADS: {camp.leads}</p>
                      <p>INVESTIDO: R$ {camp.spent?.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-primary opacity-50" />
                  </div>
                </div>
              ))}
              {activeCampaigns.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-muted-foreground italic uppercase tracking-widest">
                  Nenhuma campanha ativa no momento.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
