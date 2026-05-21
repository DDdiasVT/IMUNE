"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Filter, Search, MoreHorizontal, User, CheckCircle2, Clock, XCircle, Trash2, Edit2, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Sale, Service, Client } from "@/types";

import { db } from "@/lib/services";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    client_name: "",
    service_id: "",
    value: "",
    status: "proposal" as Sale['status'],
    salesperson_id: "1"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesData, servicesData, clientsData] = await Promise.all([
        db.sales.list(),
        db.services.list(),
        db.clients.list()
      ]);
      setSales(salesData);
      setServices(servicesData);
      setClients(clientsData);
    } catch (err) {
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formData.value);

    try {
      if (editingSale) {
        await db.sales.update(editingSale.id, { value: val, status: formData.status });
      } else {
        await db.sales.create({
          salesperson_id: formData.salesperson_id,
          service_id: formData.service_id,
          value: val,
          discount: 0,
          commission_value: 0,
          is_recurring: false,
          status: formData.status,
          closing_date: formData.status === 'closed' ? new Date().toISOString() : null,
        });
        
        // Automation: Create client if closed
        if (formData.status === 'closed') {
          await db.clients.create({
            name: formData.client_name,
            niche: "Lead Comercial",
            status: "active",
            notes: "Criado automaticamente via venda fechada."
          });
        }
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert("Erro ao registrar venda.");
    }
  };

  const createClientFromSale = (name: string) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      niche: "Pendente",
      status: "active",
      entry_date: new Date().toISOString().split('T')[0],
      responsible_id: "Joao Vitor",
      logo_url: name.substring(0, 2).toUpperCase(),
      contract_url: null,
      access_info: null,
      notes: "Criado automaticamente via venda fechada.",
      created_at: new Date().toISOString()
    };
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir registro de venda?")) {
      try {
        await db.sales.delete(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting sale:", err);
      }
    }
  };

  const openModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        client_name: "Cliente Existente",
        service_id: sale.service_id,
        value: sale.value.toString(),
        status: sale.status,
        salesperson_id: "1"
      });
    } else {
      setEditingSale(null);
      setFormData({ client_name: "", service_id: services[0]?.id || "", value: "", status: "proposal", salesperson_id: "1" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight">Registro de Vendas</h3>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <div className="space-y-3">
        {sales.map((sale) => {
          const service = services.find(s => s.id === sale.service_id);
          return (
            <Card key={sale.id} className="hover:border-primary/50 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      sale.status === 'closed' ? 'bg-emerald-500/10 text-emerald-500' :
                      sale.status === 'lost' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {sale.status === 'closed' ? <CheckCircle2 className="h-5 w-5" /> : 
                       sale.status === 'lost' ? <XCircle className="h-5 w-5" /> : 
                       <Clock className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Venda #{sale.id.substring(0, 4)}</h4>
                      <p className="text-xs text-muted-foreground">{service?.name || 'Serviço'} • {new Date(sale.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center justify-around gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Valor</p>
                      <p className="text-sm font-bold">R$ {sale.value.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                      <Badge variant={
                        sale.status === 'closed' ? 'success' : 
                        sale.status === 'lost' ? 'destructive' : 
                        'secondary'
                      } className="mt-1">
                        {sale.status === 'closed' ? 'Fechado' : 
                         sale.status === 'lost' ? 'Perdido' : 'Em Negociação'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sale.status === 'closed' && (
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 gap-1">
                        <Rocket className="h-3 w-3" />
                        Cliente Criado
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={() => openModal(sale)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive" onClick={() => handleDelete(sale.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Registrar Venda">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome do Cliente" placeholder="Ex: Maria Silva" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Serviço</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.service_id}
              onChange={(e) => setFormData({...formData, service_id: e.target.value})}
            >
              <option value="">Selecione um serviço</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
              ))}
            </select>
          </div>
          <Input label="Valor Final (R$)" type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="proposal">Proposta / Lead</option>
              <option value="negotiation">Em Negociação</option>
              <option value="closed">Fechado (Ativar Operação)</option>
              <option value="lost">Perdido</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Registro</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
