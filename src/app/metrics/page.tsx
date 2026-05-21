"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3, 
  Plus, 
  Filter,
  Calendar,
  ArrowUpRight,
  MousePointer2,
  Percent,
  LineChart,
  Activity,
  Beaker,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/services";
import { Client } from "@/types";

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ab_tests'>('dashboard');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [abTests, setAbTests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isABModalOpen, setIsABModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState<string>("all");

  // State para Testes A/B
  const [abFormData, setAbFormData] = useState({
    client_id: "",
    name: "",
    hypothesis: "",
    variants: [{ name: "Variante A", leads: 0, investment: 0, revenue: 0, page_views: 0, whatsapp_clicks: 0 }]
  });

  const [formData, setFormData] = useState({
    client_id: "",
    period_date: new Date().toISOString().split('T')[0],
    leads: "",
    investment: "",
    followers: "",
    impressions: "",
    clicks: "",
    page_views: "",
    whatsapp_clicks: "",
    scroll_rate: "",
    new_customers: "",
    revenue: ""
  });

  useEffect(() => {
    fetchData();
  }, [selectedClient, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clientsData = await db.clients.list();
      setClients(clientsData);

      if (activeTab === 'dashboard') {
        let query = supabase.from('metrics').select('*');
        if (selectedClient !== "all") {
          if (selectedClient === "internal") query = query.is('client_id', null);
          else query = query.eq('client_id', selectedClient);
        }
        const { data } = await query.order('period_date', { ascending: true });
        setMetrics(data || []);
      } else {
        let query = supabase.from('ab_tests').select('*, ab_test_variants(*)');
        if (selectedClient !== "all") {
          query = query.eq('client_id', selectedClient);
        }
        const { data } = await query.order('created_at', { ascending: false });
        setAbTests(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleABSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: test, error: testError } = await supabase.from('ab_tests').insert({
        client_id: abFormData.client_id,
        name: abFormData.name,
        hypothesis: abFormData.hypothesis
      }).select().single();

      if (testError) throw testError;

      const variants = abFormData.variants.map(v => ({
        test_id: test.id,
        ...v
      }));

      await supabase.from('ab_test_variants').insert(variants);
      fetchData();
      setIsABModalOpen(false);
    } catch (err) {
      alert("Erro ao criar teste A/B");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        client_id: formData.client_id === "internal" ? null : formData.client_id,
        leads: parseInt(formData.leads || "0"),
        investment: parseFloat(formData.investment || "0"),
        followers: parseInt(formData.followers || "0"),
        impressions: parseInt(formData.impressions || "0"),
        clicks: parseInt(formData.clicks || "0"),
        page_views: parseInt(formData.page_views || "0"),
        whatsapp_clicks: parseInt(formData.whatsapp_clicks || "0"),
        scroll_rate: parseFloat(formData.scroll_rate || "0"),
        new_customers: parseInt(formData.new_customers || "0"),
        revenue: parseFloat(formData.revenue || "0")
      };
      await supabase.from('metrics').insert(payload);
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Erro ao salvar.");
    }
  };

  // Cálculos de KPIs Dash
  const totals = metrics.reduce((acc, m) => ({
    leads: acc.leads + (m.leads || 0),
    inv: acc.inv + (m.investment || 0),
    rev: acc.rev + (m.revenue || 0),
    cust: acc.cust + (m.new_customers || 0),
    views: acc.views + (m.page_views || 0),
    wa: acc.wa + (m.whatsapp_clicks || 0),
    imp: acc.imp + (m.impressions || 0)
  }), { leads: 0, inv: 0, rev: 0, cust: 0, views: 0, wa: 0, imp: 0 });

  const cac = totals.cust > 0 ? totals.inv / totals.cust : 0;
  const roi = totals.inv > 0 ? (totals.rev - totals.inv) / totals.inv : 0;
  const lpConv = totals.views > 0 ? (totals.wa / totals.views) * 100 : 0;
  const cpm = totals.imp > 0 ? (totals.inv / totals.imp) * 1000 : 0;

  const chartData = metrics.map(m => ({
    data: new Date(m.period_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    leads: m.leads,
    conv: m.page_views > 0 ? (m.whatsapp_clicks / m.page_views) * 100 : 0
  }));

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Inteligência de Dados</h2>
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Performance Geral
            </button>
            <button 
              onClick={() => setActiveTab('ab_tests')}
              className={`text-sm font-medium transition-colors ${activeTab === 'ab_tests' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Laboratório A/B
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm outline-none" value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
            <option value="all">Visão Geral</option>
            <option value="internal">Interno</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {activeTab === 'dashboard' ? (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Lançar Semana</Button>
          ) : (
            <Button onClick={() => setIsABModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20">
              <Beaker className="h-4 w-4" /> Novo Experimento
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Dashboard Anterior */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 shrink-0">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">ROI Atual</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roi.toFixed(2)}x</div>
                <p className="text-[10px] text-emerald-500 font-bold tracking-widest">RETORNO SOBRE INV.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">CAC Médio</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {cac.toFixed(2)}</div>
                <p className="text-[10px] text-muted-foreground">CUSTO POR CLIENTE</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Conv. Página</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lpConv.toFixed(1)}%</div>
                <p className="text-[10px] text-muted-foreground">LP p/ WHATSAPP</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">CPM</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {cpm.toFixed(2)}</div>
                <p className="text-[10px] text-muted-foreground">CUSTO POR 1000 IMP.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Investimento</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totals.inv.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground">TOTAL NO PERÍODO</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
            <Card className="col-span-4 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Evolução de Conversão</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="data" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="leads" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="conv" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3 flex flex-col">
              <CardHeader><CardTitle className="text-base">Métricas da Página de Vendas</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de Scroll Média</span>
                    <span className="font-bold">{ (metrics.reduce((a, b) => a + (b.scroll_rate || 0), 0) / (metrics.length || 1)).toFixed(1) }%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${metrics[metrics.length-1]?.scroll_rate || 0}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">Page Views</p>
                    <p className="text-xl font-bold">{totals.views}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase">Cliques Whats</p>
                    <p className="text-xl font-bold">{totals.wa}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* ABA DE TESTES A/B */
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-8">
          {abTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-2xl">
              <Beaker className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold">Nenhum teste A/B ativo</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                Comece um novo experimento multivariável para descobrir qual criativo ou página performa melhor para seus clientes.
              </p>
              <Button onClick={() => setIsABModalOpen(true)} className="mt-6 gap-2">
                <Plus className="h-4 w-4" /> Criar Primeiro Teste
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {abTests.map((test) => {
                const client = clients.find(c => c.id === test.client_id);
                return (
                  <Card key={test.id} className="overflow-hidden border-border/50">
                    <CardHeader className="bg-secondary/10 border-b">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-indigo-500 border-indigo-500/30">TESTE A/B</Badge>
                            <span className="text-xs text-muted-foreground">Iniciado em {new Date(test.start_date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-lg font-bold">{test.name}</h3>
                          <p className="text-sm text-primary font-bold uppercase">{client?.name}</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2"><Activity className="h-4 w-4" /> Ver Relatório Completo</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-6 bg-secondary/20 p-4 rounded-lg border border-border/50">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                          <Info className="h-3 w-3" /> Hipótese do Experimento
                        </h4>
                        <p className="text-sm italic text-foreground/80">{test.hypothesis}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {test.ab_test_variants.map((variant: any, idx: number) => {
                          const conv = variant.page_views > 0 ? (variant.leads / variant.page_views) * 100 : 0;
                          const roi = variant.investment > 0 ? (variant.revenue / variant.investment) : 0;
                          const isWinner = idx === 0; // Mock winner logic: first is winner for visual

                          return (
                            <div key={variant.id} className={`p-4 rounded-xl border-2 transition-all ${isWinner ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border/50 bg-card'}`}>
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-bold text-sm">{variant.name}</h5>
                                {isWinner && <Badge className="bg-emerald-500 text-white">VENCEDOR</Badge>}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Conversão</p>
                                  <p className="text-lg font-bold">{conv.toFixed(1)}%</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold">ROI</p>
                                  <p className="text-lg font-bold">{roi.toFixed(2)}x</p>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-muted-foreground">INVESTIMENTO</span>
                                  <span className="font-bold">R$ {variant.investment.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL LANÇAMENTO SEMANAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lançar Dados Semanais">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Conta / Cliente</label>
              <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} required>
                <option value="">Selecione...</option>
                <option value="internal">Agência (Interno)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Data Inicial da Semana" type="date" value={formData.period_date} onChange={e => setFormData({...formData, period_date: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-4"><Input label="Investimento (R$)" type="number" value={formData.investment} onChange={e => setFormData({...formData, investment: e.target.value})} /><Input label="Faturamento (R$)" type="number" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} /><Input label="Novos Clientes" type="number" value={formData.new_customers} onChange={e => setFormData({...formData, new_customers: e.target.value})} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-4"><Input label="Leads" type="number" value={formData.leads} onChange={e => setFormData({...formData, leads: e.target.value})} /><Input label="Impressões" type="number" value={formData.impressions} onChange={e => setFormData({...formData, impressions: e.target.value})} /><Input label="Cliques (Ads)" type="number" value={formData.clicks} onChange={e => setFormData({...formData, clicks: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-4 border-t pt-4 bg-secondary/20 p-3 rounded-lg"><Input label="Page Views" type="number" value={formData.page_views} onChange={e => setFormData({...formData, page_views: e.target.value})} /><Input label="Cliques Whats" type="number" value={formData.whatsapp_clicks} onChange={e => setFormData({...formData, whatsapp_clicks: e.target.value})} /><Input label="Taxa Scroll (%)" type="number" value={formData.scroll_rate} onChange={e => setFormData({...formData, scroll_rate: e.target.value})} /></div>
          <div className="flex justify-end gap-3 pt-4"><Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit">Salvar Semana</Button></div>
        </form>
      </Modal>

      {/* MODAL NOVO TESTE A/B */}
      <Modal isOpen={isABModalOpen} onClose={() => setIsABModalOpen(false)} title="Novo Experimento A/B">
        <form onSubmit={handleABSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <select className="w-full h-10 rounded-lg border bg-secondary/50 px-3 text-sm outline-none" value={abFormData.client_id} onChange={e => setAbFormData({...abFormData, client_id: e.target.value})} required>
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Nome do Teste" placeholder="Ex: Headline Página de Vendas" value={abFormData.name} onChange={e => setAbFormData({...abFormData, name: e.target.value})} required />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Hipótese / Mudanças efetuadas</label>
            <textarea 
              className="w-full min-h-[80px] bg-secondary/50 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Explique o que mudou e o que esperamos com este teste..."
              value={abFormData.hypothesis}
              onChange={e => setAbFormData({...abFormData, hypothesis: e.target.value})}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-500">Variantes do Experimento</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAbFormData({...abFormData, variants: [...abFormData.variants, { name: `Variante ${String.fromCharCode(65 + abFormData.variants.length)}`, leads: 0, investment: 0, revenue: 0, page_views: 0, whatsapp_clicks: 0 }]})} className="gap-2">
                <Plus className="h-3 w-3" /> Add Variante
              </Button>
            </div>

            {abFormData.variants.map((v, idx) => (
              <div key={idx} className="p-4 border rounded-xl bg-secondary/10 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <input className="bg-transparent font-bold text-sm outline-none border-b border-transparent focus:border-indigo-500" value={v.name} onChange={e => {
                    const newVariants = [...abFormData.variants];
                    newVariants[idx].name = e.target.value;
                    setAbFormData({...abFormData, variants: newVariants});
                  }} />
                  {idx > 1 && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                    const newVariants = abFormData.variants.filter((_, i) => i !== idx);
                    setAbFormData({...abFormData, variants: newVariants});
                  }}><Trash2 className="h-3 w-3" /></Button>}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input label="Investimento (R$)" type="number" value={v.investment} onChange={e => {
                    const newVariants = [...abFormData.variants];
                    newVariants[idx].investment = parseFloat(e.target.value || "0");
                    setAbFormData({...abFormData, variants: newVariants});
                  }} />
                  <Input label="Faturamento (R$)" type="number" value={v.revenue} onChange={e => {
                    const newVariants = [...abFormData.variants];
                    newVariants[idx].revenue = parseFloat(e.target.value || "0");
                    setAbFormData({...abFormData, variants: newVariants});
                  }} />
                  <Input label="Page Views" type="number" value={v.page_views} onChange={e => {
                    const newVariants = [...abFormData.variants];
                    newVariants[idx].page_views = parseInt(e.target.value || "0");
                    setAbFormData({...abFormData, variants: newVariants});
                  }} />
                  <Input label="Leads / Clicks Whats" type="number" value={v.leads} onChange={e => {
                    const newVariants = [...abFormData.variants];
                    newVariants[idx].leads = parseInt(e.target.value || "0");
                    setAbFormData({...abFormData, variants: newVariants});
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" type="button" onClick={() => setIsABModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none">Lançar Experimento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
