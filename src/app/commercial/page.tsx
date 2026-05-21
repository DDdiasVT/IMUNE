"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus,
  Trophy,
  Flame,
  Save,
  Gift,
  Star,
  Zap,
  Crown,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function SalespeoplePage() {
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any | null>(null);

  const [formData, setFormData] = useState({ 
    name: "", 
    commission_rate: "10", 
    goal_easy: "", 
    goal_medium: "", 
    goal_hard: "",
    prize_easy: "",
    prize_medium: "",
    prize_hard: ""
  });
  const [goalFormData, setGoalFormData] = useState({ target_value: "", prize_description: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sp, sl, gl] = await Promise.all([
        supabase.from('salespeople').select('*'),
        supabase.from('sales').select('*'),
        supabase.from('monthly_goals').select('*').order('created_at', { ascending: false }).limit(1)
      ]);

      setSalespeople(sp.data || []);
      setSales(sl.data || []);
      
      if (gl.data && gl.data.length > 0) {
        const currentGoal = gl.data[0];
        setGoal(currentGoal);
        setGoalFormData({ 
          target_value: currentGoal.target_value.toString(), 
          prize_description: currentGoal.prize_description || "" 
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        name: formData.name, 
        commission_rate: parseFloat(formData.commission_rate || "0"),
        goal_easy: parseFloat(formData.goal_easy || "0"),
        goal_medium: parseFloat(formData.goal_medium || "0"),
        goal_hard: parseFloat(formData.goal_hard || "0"),
        prize_easy: formData.prize_easy,
        prize_medium: formData.prize_medium,
        prize_hard: formData.prize_hard
      };

      if (editingPerson) {
        const { error } = await supabase.from('salespeople').update(payload).eq('id', editingPerson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('salespeople').insert(payload);
        if (error) throw error;
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  const handleGoalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        target_value: parseFloat(goalFormData.target_value || "0"),
        prize_description: goalFormData.prize_description,
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear()
      };
      
      if (goal?.id) payload.id = goal.id;

      const { error } = await supabase.from('monthly_goals').upsert(payload);
      if (error) throw error;

      fetchData();
      setIsGoalModalOpen(false);
      alert("✅ Meta global salva!");
    } catch (err: any) {
      alert("❌ Erro: " + err.message);
    }
  };

  const totalRevenue = sales.reduce((acc, s) => acc + (s.value || 0), 0);
  const sortedSalespeople = salespeople.map(person => {
    const personSales = sales.filter(s => s.salesperson_id === person.id);
    const revenue = personSales.reduce((acc, s) => acc + (s.value || 0), 0);
    return { ...person, revenue, salesCount: personSales.length };
  }).sort((a, b) => b.revenue - a.revenue);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Sincronizando com o Quartel General...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Banner de Meta Global */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
        <Card className="col-span-full sm:col-span-2 bg-primary/10 border-primary/20 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Trophy className="h-32 w-32 rotate-12" />
           </div>
           <CardContent className="p-5 sm:p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Meta da Agência 🚀</h2>
                  <p className="text-muted-foreground">Faturamento acumulado para o prêmio coletivo.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsGoalModalOpen(true)} className="gap-2 border-primary/20 hover:bg-primary/20">
                  <Edit2 className="h-4 w-4" /> Ajustar Meta
                </Button>
              </div>

              <div className="space-y-4">
                 <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Acumulado</p>
                      <p className="text-3xl sm:text-4xl font-black text-primary">R$ {totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Objetivo</p>
                      <p className="text-xl font-bold">R$ {goal?.target_value.toLocaleString() || '0'}</p>
                    </div>
                 </div>
                 <div className="h-4 w-full bg-secondary rounded-full overflow-hidden border border-border/50 p-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                      style={{ width: `${Math.min((totalRevenue / (goal?.target_value || 1)) * 100, 100)}%` }}
                    />
                 </div>
              </div>
           </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5 text-amber-500" /> Prêmio Coletivo</CardTitle></CardHeader>
          <CardContent className="space-y-4"><p className="text-sm italic opacity-80">"{goal?.prize_description || 'Defina um prêmio para o time!'}"</p></CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Time de Vendas</h3>
          <p className="text-sm text-muted-foreground">Desempenho individual e gamificação.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setEditingPerson(null); setFormData({name: "", commission_rate: "10", goal_easy: "", goal_medium: "", goal_hard: "", prize_easy: "", prize_medium: "", prize_hard: ""}); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4" /> Adicionar Vendedor
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedSalespeople.map((person, idx) => {
          const revenue = person.revenue || 0;
          return (
            <Card key={person.id} className={`hover:border-primary/50 transition-all group relative overflow-hidden ${idx === 0 ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
              {idx === 0 && <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-bl-lg">TOP #1</div>}
              <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b">
                 <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-primary text-white' : 'bg-secondary'}`}>
                   {idx + 1}º
                 </div>
                 <div className="flex-1">
                   <CardTitle className="text-base">{person.name}</CardTitle>
                   <p className="text-[10px] text-muted-foreground uppercase font-black">Faturado: R$ {revenue.toLocaleString()}</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => { 
                   setEditingPerson(person); 
                   setFormData({
                     name: person.name, 
                     commission_rate: person.commission_rate.toString(), 
                     goal_easy: person.goal_easy?.toString() || "", 
                     goal_medium: person.goal_medium?.toString() || "", 
                     goal_hard: person.goal_hard?.toString() || "", 
                     prize_easy: person.prize_easy || "", 
                     prize_medium: person.prize_medium || "", 
                     prize_hard: person.prize_hard || ""
                   }); 
                   setIsModalOpen(true); 
                 }}>
                   <Edit2 className="h-4 w-4" />
                 </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                 <div className="space-y-4">
                    {[
                      { tier: "Bronze", value: person.goal_easy, prize: person.prize_easy, icon: Zap, color: "text-amber-700", bg: "bg-amber-700/10" },
                      { tier: "Prata", value: person.goal_medium, prize: person.prize_medium, icon: Star, color: "text-slate-400", bg: "bg-slate-400/10" },
                      { tier: "Ouro", value: person.goal_hard, prize: person.prize_hard, icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10" }
                    ].map((m, i) => (
                      <div key={i} className={`p-3 rounded-lg border flex items-center justify-between transition-all ${revenue >= (m.value || Infinity) && m.value > 0 ? `border-emerald-500/50 ${m.bg}` : 'border-border/30 opacity-50'}`}>
                        <div className="flex items-center gap-3">
                           <m.icon className={`h-4 w-4 ${m.color}`} />
                           <div>
                              <p className={`text-[10px] font-black uppercase ${m.color}`}>{m.tier}</p>
                              <p className="text-xs font-medium">R$ {m.value?.toLocaleString()}</p>
                           </div>
                        </div>
                        {revenue >= (m.value || Infinity) && m.value > 0 ? (
                          <div className="text-right">
                             <p className="text-[8px] uppercase font-bold text-emerald-500">Conquistado!</p>
                             <p className="text-[10px] font-bold">{m.prize}</p>
                          </div>
                        ) : (
                          <p className="text-[8px] uppercase font-bold opacity-40">Faltam R$ {Math.max(0, (m.value || 0) - revenue).toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Configurar Meta Global">
        <form onSubmit={handleGoalUpdate} className="space-y-4">
          <Input label="Valor da Meta da Agência (R$)" type="number" value={goalFormData.target_value} onChange={e => setGoalFormData({...goalFormData, target_value: e.target.value})} required />
          <div className="space-y-1.5"><label className="text-sm font-medium text-muted-foreground">Prêmio Coletivo</label><textarea className="w-full min-h-[100px] bg-secondary/50 border rounded-lg p-3 text-sm outline-none" value={goalFormData.prize_description} onChange={e => setGoalFormData({...goalFormData, prize_description: e.target.value})} /></div>
          <Button type="submit" className="w-full">Salvar Meta Global</Button>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPerson ? "Configurar Gamificação" : "Novo Vendedor"}>
        <form onSubmit={handlePersonSubmit} className="space-y-6">
          <Input label="Nome do Vendedor" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid gap-4 border-t pt-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                   <h4 className="text-xs font-bold text-amber-700 uppercase">1. Nível Bronze</h4>
                   <Input label="Valor da Meta" type="number" value={formData.goal_easy} onChange={e => setFormData({...formData, goal_easy: e.target.value})} />
                   <Input label="Prêmio" value={formData.prize_easy} onChange={e => setFormData({...formData, prize_easy: e.target.value})} />
                </div>
                <div className="space-y-4">
                   <h4 className="text-xs font-bold text-slate-400 uppercase">2. Nível Prata</h4>
                   <Input label="Valor da Meta" type="number" value={formData.goal_medium} onChange={e => setFormData({...formData, goal_medium: e.target.value})} />
                   <Input label="Prêmio" value={formData.prize_medium} onChange={e => setFormData({...formData, prize_medium: e.target.value})} />
                </div>
             </div>
             <div className="space-y-4 border-t pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase text-center">3. Nível Ouro</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Valor da Meta" type="number" value={formData.goal_hard} onChange={e => setFormData({...formData, goal_hard: e.target.value})} />
                  <Input label="Prêmio" value={formData.prize_hard} onChange={e => setFormData({...formData, prize_hard: e.target.value})} />
                </div>
             </div>
          </div>
          <Button type="submit" className="w-full">Salvar Vendedor</Button>
        </form>
      </Modal>
    </div>
  );
}
