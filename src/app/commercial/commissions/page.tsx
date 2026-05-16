"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  User, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  Briefcase,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

export default function CommissionsPage() {
  const [salespeople, setSalespeople] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const fetchCommissionData = async () => {
    try {
      const [sp, sl] = await Promise.all([
        supabase.from('salespeople').select('*'),
        supabase.from('sales').select('*, clients(name)')
      ]);

      setSalespeople(sp.data || []);
      setSales(sl.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCommissions = sales.reduce((acc, s) => acc + (s.commission_value || 0), 0);
  const pendingCommissions = sales.filter(s => s.status !== 'paid').reduce((acc, s) => acc + (s.commission_value || 0), 0);

  if (loading) return <div className="p-10 text-center opacity-50 text-white">Calculando Comissões Reais...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-white">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Total Acumulado</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCommissions.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Comissões geradas no período</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Aguardando Pagamento</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">R$ {pendingCommissions.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Total pendente de liberação</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Média por Venda</CardTitle>
            <PieChart className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              R$ {sales.length > 0 ? (totalCommissions / sales.length).toLocaleString() : '0'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Ticket médio de comissão</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Extrato Detalhado de Comissões</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.map((sale) => {
              const salesperson = salespeople.find(p => p.id === sale.salesperson_id);
              return (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-secondary/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{sale.clients?.name || 'Cliente Removido'}</p>
                      <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                        <User className="h-3 w-3" /> {salesperson?.name || 'Vendedor Desconhecido'} • {new Date(sale.closing_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500 text-sm">R$ {sale.commission_value?.toLocaleString()}</p>
                    <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      {salesperson?.commission_rate}% de R$ {sale.value?.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
