"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  Target, 
  Award, 
  Flame, 
  TrendingUp, 
  ChevronRight,
  Medal,
  Star,
  Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export default function RankingPage() {
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankingData();
  }, []);

  const fetchRankingData = async () => {
    try {
      const [sp, sl, gl] = await Promise.all([
        supabase.from('salespeople').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('monthly_goals').select('*').order('created_at', { ascending: false }).limit(1).single()
      ]);

      setSalespeople(sp.data || []);
      setSales(sl.data || []);
      setGoal(gl.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((acc, s) => acc + (s.value || 0), 0);
  const target = goal?.target_value || 100000;
  const progress = Math.min((totalRevenue / target) * 100, 100);

  const sortedRanking = salespeople.map(person => {
    const personSales = sales.filter(s => s.salesperson_id === person.id);
    const revenue = personSales.reduce((acc, s) => acc + (s.value || 0), 0);
    const count = personSales.length;
    return { ...person, revenue, count };
  }).sort((a, b) => b.revenue - a.revenue);

  if (loading) return <div className="p-10 text-center opacity-50">Carregando Ranking Real...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Meta Global do Mês */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Meta Global do Mês</h3>
                <p className="text-sm text-muted-foreground">Faltam R$ {Math.max(0, target - totalRevenue).toLocaleString()} para atingir o objetivo de {new Date().toLocaleDateString('pt-BR', { month: 'long' })}.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">R$ {totalRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ R$ {target.toLocaleString()}</span></p>
              <p className="text-sm font-bold text-primary">{progress.toFixed(1)}% CONCLUÍDO</p>
            </div>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lista de Ranking */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Ranking de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedRanking.map((person, idx) => (
              <div key={person.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${idx === 0 ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'hover:bg-secondary/30'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-primary text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-secondary text-muted-foreground'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold">{person.name}</p>
                    <p className="text-xs text-muted-foreground">{person.count} vendas • {(person.revenue / (person.monthly_goal || 1) * 100).toFixed(0)}% da meta ind.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">R$ {person.revenue.toLocaleString()}</p>
                  {idx === 0 && <Badge className="bg-primary text-[10px] animate-pulse">LÍDER DO MÊS</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prêmio Atualizado */}
        <Card className="bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Prêmio do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-6 py-8">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center relative">
               <Trophy className="h-12 w-12 text-primary" />
               <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2 animate-bounce">
                  <Star className="h-4 w-4 text-white fill-white" />
               </div>
            </div>
            <div>
               <h4 className="text-xl font-bold">{goal?.prize_description || "Meta Coletiva"}</h4>
               <p className="text-sm text-muted-foreground mt-2 px-4">Para todo o time se baterem 100% da meta da agência!</p>
            </div>
            <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">Ver Regulamento</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
