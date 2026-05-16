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

export default function ClientOverview() {
  return (
    <div className="space-y-8">
      {/* Resumo Executivo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Seguidores", value: "12.4k", icon: Users, trend: "+120", positive: true },
          { label: "Investimento", value: "R$ 2.100", icon: DollarSign, trend: "+R$ 300", positive: false },
          { label: "Leads", value: "75", icon: MessageSquare, trend: "+24%", positive: true },
          { label: "CPL", value: "R$ 28,00", icon: Target, trend: "-R$ 4,00", positive: true },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.positive ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                <span className={`text-xs font-medium ${stat.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de Crescimento */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Geração de Leads vs Investimento</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
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

        {/* Métricas Comerciais */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Funil Comercial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Leads Totais", value: 75, percent: 100 },
              { label: "Agendamentos", value: 32, percent: 42 },
              { label: "Comparecimento", value: 24, percent: 75 },
              { label: "Fechamentos", value: 8, percent: 33 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.value} <span className="text-xs font-normal text-muted-foreground">({item.percent}%)</span></span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Melhores Conteúdos */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conteúdos de Melhor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "3 Sinais de Burnout", type: "Reel", views: "12.4k", eng: "8.2%" },
                { title: "Como lidar com a ansiedade", type: "Reel", views: "10.1k", eng: "7.5%" },
                { title: "O que é terapia cognitiva?", type: "Post", views: "4.5k", eng: "5.1%" },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center font-bold text-xs text-muted-foreground">IMG</div>
                    <div>
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{c.views}</p>
                    <p className="text-xs text-emerald-500">{c.eng} eng.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Campanhas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Captação WhatsApp", status: "running", leads: 42 },
              { name: "Inscrição Workshop", status: "production", leads: 0 },
            ].map((camp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{camp.name}</span>
                  <Badge variant={camp.status === 'running' ? 'success' : 'secondary'}>
                    {camp.status === 'running' ? 'Rodando' : 'Produção'}
                  </Badge>
                </div>
                {camp.leads > 0 && <p className="text-xs text-muted-foreground">{camp.leads} leads gerados</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
