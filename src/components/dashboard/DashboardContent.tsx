"use client";

import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const stats = [
  { label: "Leads Hoje", value: "12", icon: Users, trend: "+20%", color: "text-blue-500" },
  { label: "Conteúdos Pendentes", value: "8", icon: Clock, trend: "-5%", color: "text-amber-500" },
  { label: "Aprovações", value: "3", icon: FileCheck, trend: "0%", color: "text-purple-500" },
  { label: "Tasks Atrasadas", value: "2", icon: AlertCircle, trend: "+1", color: "text-red-500" },
];

const data = [
  { name: "Seg", leads: 4000, revenue: 2400 },
  { name: "Ter", leads: 3000, revenue: 1398 },
  { name: "Qua", leads: 2000, revenue: 9800 },
  { name: "Qui", leads: 2780, revenue: 3908 },
  { name: "Sex", leads: 1890, revenue: 4800 },
  { name: "Sáb", leads: 2390, revenue: 3800 },
  { name: "Dom", leads: 3490, revenue: 4300 },
];

export function DashboardContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta, Joao</h2>
        <p className="text-muted-foreground">Aqui está o que está acontecendo na sua agência hoje.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend.startsWith("+") ? "text-emerald-500" : "text-red-500"}>
                  {stat.trend}
                </span>{" "}
                em relação a ontem
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance de Leads</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Novo lead qualificado: Maria Souza</p>
                    <p className="text-xs text-muted-foreground">Há 15 minutos • Via Instagram</p>
                  </div>
                  <Badge variant="secondary">CRM</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Próximas Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Vídeo Institucional - Loja X", date: "Amanhã", status: "Design", type: "Vídeo" },
                { title: "Pack de Stories - Cliente Y", date: "18 Out", status: "Copy", type: "Design" },
                { title: "Planejamento Mensal - Z", date: "20 Out", status: "Aprovação", type: "Estratégia" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.date} • {item.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: "Call de Alinhamento", time: "10:00", priority: "high" },
                { task: "Revisar Copies", time: "14:30", priority: "medium" },
                { task: "Subir Campanhas", time: "16:00", priority: "high" },
              ].map((t, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.task}</p>
                    <p className="text-xs text-muted-foreground">{t.time}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${t.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
