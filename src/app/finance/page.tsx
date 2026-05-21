"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Plus, 
  Trash2, 
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Calendar,
  Users as UsersIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export default function FinancePage() {
  const [sales, setSales] = useState<any[]>([]);
  const [costs, setCosts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [costFormData, setCostFormData] = useState({
    label: "",
    value: "",
    category: "Software",
    period_date: new Date().toISOString().split('T')[0],
    client_id: ""
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [salesRes, costsRes, clientsRes] = await Promise.all([
        supabase.from('sales').select('*, clients(*), salespeople(*)'),
        supabase.from('agency_costs').select('*, clients(*)').order('period_date', { ascending: false }),
        supabase.from('clients').select('*').order('name')
      ]);
      setSales(salesRes.data || []);
      setCosts(costsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('agency_costs').insert({
      ...costFormData,
      value: parseFloat(costFormData.value),
      client_id: costFormData.client_id || null
    });
    setIsCostModalOpen(false);
    setCostFormData({ label: "", value: "", category: "Software", period_date: new Date().toISOString().split('T')[0], client_id: "" });
    fetchFinanceData();
  };

  const handleDeleteCost = async (id: string) => {
    if (confirm("Excluir este custo?")) {
      await supabase.from('agency_costs').delete().eq('id', id);
      fetchFinanceData();
    }
  };

  // Cálculos Inteligentes (Respeitando Modelos de Sociedade)
  let totalRevenue = 0;
  let totalCommissions = 0;
  sales.forEach(s => {
    const isPartnership = s.clients?.billing_model === 'partnership';
    const perc = isPartnership ? ((s.clients?.partnership_percentage || 0) / 100) : 1;
    totalRevenue += ((s.value || 0) * perc);
    totalCommissions += (s.commission_value || 0);
  });

  let totalCosts = 0;
  costs.forEach(c => {
    const isPartnership = c.clients?.billing_model === 'partnership';
    const perc = isPartnership ? ((c.clients?.partnership_percentage || 0) / 100) : 1;
    totalCosts += ((c.value || 0) * perc);
  });

  const netProfit = totalRevenue - totalCommissions - totalCosts;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Financeiro Agência</h2>
          <p className="text-sm text-muted-foreground">Faturamento, custos partilhados e lucro real.</p>
        </div>
        <Button onClick={() => setIsCostModalOpen(true)} className="gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" /> Registrar Custo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Receita Agência</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">R$ {totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Líquido de parcerias</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Comissões</CardTitle>
            <PieChart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">R$ {totalCommissions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Custos Agência</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {totalCosts.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Fixos + parte em sociedades</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-primary font-bold tracking-widest">Lucro Real (Líquido)</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {netProfit.toLocaleString()}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">Margem Real: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Entradas */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Entradas & Parcerias</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.map((sale) => {
                const isPartnership = sale.clients?.billing_model === 'partnership';
                const agencyPart = isPartnership ? ((sale.value || 0) * (sale.clients?.partnership_percentage / 100)) : (sale.value || 0);
                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500"><TrendingUp className="h-4 w-4" /></div>
                      <div>
                        <p className="text-sm font-bold">{sale.clients?.name}</p>
                        <Badge variant="outline" className="text-[9px] uppercase">{sale.clients?.billing_model === 'partnership' ? `Sociedade ${sale.clients?.partnership_percentage}%` : 'Fixo'}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">R$ {agencyPart.toLocaleString()}</p>
                      {isPartnership && <p className="text-[9px] text-muted-foreground">Bruto: R$ {sale.value.toLocaleString()}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Saídas */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Saídas & Custos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costs.map((cost) => {
                const isPartnership = cost.clients?.billing_model === 'partnership';
                const agencyCost = isPartnership ? ((cost.value || 0) * (cost.clients?.partnership_percentage / 100)) : (cost.value || 0);
                return (
                  <div key={cost.id} className="flex items-center justify-between p-3 border rounded-lg group hover:border-destructive/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center text-destructive"><TrendingDown className="h-4 w-4" /></div>
                      <div>
                        <p className="text-sm font-bold">{cost.label}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{cost.clients?.name ? `Para: ${cost.clients.name}` : cost.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-destructive">R$ {agencyCost.toLocaleString()}</p>
                        {isPartnership && <p className="text-[9px] text-muted-foreground">Total: R$ {cost.value.toLocaleString()}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-destructive transition-opacity" onClick={() => handleDeleteCost(cost.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={isCostModalOpen} onClose={() => setIsCostModalOpen(false)} title="Registrar Despesa">
        <form onSubmit={handleAddCost} className="space-y-4">
          <Input label="Descrição do Gasto" value={costFormData.label} onChange={e => setCostFormData({...costFormData, label: e.target.value})} required placeholder="Ex: Adobe, Facebook Ads..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Valor Total (R$)" type="number" value={costFormData.value} onChange={e => setCostFormData({...costFormData, value: e.target.value})} required />
            <Input label="Data" type="date" value={costFormData.period_date} onChange={e => setCostFormData({...costFormData, period_date: e.target.value})} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Vincular a Cliente (Opcional)</label>
              <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={costFormData.client_id} onChange={e => setCostFormData({...costFormData, client_id: e.target.value})}>
                <option value="">Geral Agência (100% Custo)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.billing_model === 'partnership' ? `(Sociedade ${c.partnership_percentage}%)` : ''}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={costFormData.category} onChange={e => setCostFormData({...costFormData, category: e.target.value})}>
                <option value="Software">Software</option>
                <option value="Anúncios">Anúncios</option>
                <option value="Salários">Salários</option>
                <option value="Impostos">Impostos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCostModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-destructive text-white hover:bg-destructive/90">Salvar Despesa</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
