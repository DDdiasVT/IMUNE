"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  MessageSquare,
  Briefcase,
  Trophy,
  Edit2,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    leads: 0,
    activeClients: 0,
    pendingTasks: 0
  });
  const [goal, setGoal] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalFormData, setGoalFormData] = useState({ target_value: "", prize_description: "" });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, salesRes, clientsRes, tasksRes, goalRes] = await Promise.all([
        supabase.from('metrics').select('revenue, leads, period_date').order('period_date', { ascending: true }),
        supabase.from('sales').select('*, clients(billing_model, partnership_percentage)'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('monthly_goals').select('*').order('created_at', { ascending: false }).limit(1).single()
      ]);

      const totalRevenue = salesRes.data?.reduce((acc, curr) => {
        const isPartnership = curr.clients?.billing_model === 'partnership';
        const perc = isPartnership ? (curr.clients?.partnership_percentage / 100) : 1;
        return acc + ((curr.value || 0) * perc);
      }, 0) || 0;
      const totalLeads = metricsRes.data?.reduce((acc, curr) => acc + (curr.leads || 0), 0) || 0;

      setStats({
        revenue: totalRevenue,
        leads: totalLeads,
        activeClients: clientsRes.count || 0,
        pendingTasks: tasksRes.count || 0
      });

      setGoal(goalRes.data);
      if (goalRes.data) {
        setGoalFormData({ target_value: goalRes.data.target_value.toString(), prize_description: goalRes.data.prize_description });
      }

      const formattedChart = metricsRes.data?.slice(-6).map(m => ({
        name: new Date(m.period_date).toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' }),
        faturamento: m.revenue,
        leads: m.leads
      })) || [];

      setChartData(formattedChart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      target_value: parseFloat(goalFormData.target_value),
      prize_description: goalFormData.prize_description,
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear()
    };
    
    if (goal) {
      await supabase.from('monthly_goals').update(payload).eq('id', goal.id);
    } else {
      await supabase.from('monthly_goals').insert(payload);
    }
    fetchDashboardData();
    setIsGoalModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Cristina OS</h2>
          <p className="text-muted-foreground">Aqui está o resumo da sua operação.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/crm"><Button className="gap-2"><Plus className="h-4 w-4" /> Novo Lead</Button></Link>
          <Link href="/tasks"><Button variant="outline" className="gap-2">Ver Tarefas</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Faturamento Total</CardTitle><DollarSign className="h-4 w-4 text-primary" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {stats.revenue.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Leads Gerados</CardTitle><Target className="h-4 w-4 text-primary" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.leads}</div></CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle><Briefcase className="h-4 w-4 text-primary" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.activeClients}</div></CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle><CheckSquare className="h-4 w-4 text-primary" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-500">{stats.pendingTasks}</div></CardContent>
        </Card>
      </div>

      {/* Barra de Meta do Mês */}
      <Card className="bg-primary/10 border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Trophy className="h-24 w-24 rotate-12" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Objetivo do Mês <span className="text-sm font-normal text-muted-foreground">({Math.min((stats.revenue / (goal?.target_value || 1)) * 100, 100).toFixed(0)}%)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Prêmio: <span className="text-amber-500 font-bold">{goal?.prize_description || "Defina um prêmio!"}</span></p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsGoalModalOpen(true)} className="gap-2">
                  <Edit2 className="h-3 w-3" /> Ajustar Meta
                </Button>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                  style={{ width: `${Math.min((stats.revenue / (goal?.target_value || 1)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                <span>R$ {stats.revenue.toLocaleString()}</span>
                <span>META: R$ {goal?.target_value.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 h-[400px]">
          <CardHeader><CardTitle>Crescimento de Faturamento</CardTitle></CardHeader>
          <CardContent className="h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="faturamento" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle>Operação Rápida</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Link href="/clients"><div className="p-4 border rounded-xl hover:bg-secondary/50 transition-all cursor-pointer flex items-center justify-between group"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Users className="h-5 w-5" /></div><div><p className="font-bold text-sm">Gerenciar Clientes</p><p className="text-xs text-muted-foreground">Ver lista e dados estratégicos</p></div></div><ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" /></div></Link>
            <Link href="/metrics"><div className="p-4 border rounded-xl hover:bg-secondary/50 transition-all cursor-pointer flex items-center justify-between group"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500"><TrendingUp className="h-5 w-5" /></div><div><p className="font-bold text-sm">Laboratório de Dados</p><p className="text-xs text-muted-foreground">Testes A/B e performance</p></div></div><ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" /></div></Link>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Configurar Meta e Prêmio da Agência">
        <form onSubmit={handleGoalUpdate} className="space-y-4">
          <Input label="Valor da Meta (R$)" type="number" value={goalFormData.target_value} onChange={e => setGoalFormData({...goalFormData, target_value: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Descrição do Prêmio</label>
            <textarea 
              className="w-full min-h-[100px] bg-secondary/50 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ex: Jantar de Luxo para o time + Bônus de R$ 500 para o TOP #1"
              value={goalFormData.prize_description}
              onChange={e => setGoalFormData({...goalFormData, prize_description: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsGoalModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Salvar Meta</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
