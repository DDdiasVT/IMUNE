"use client";

import { useState, useEffect } from "react";
import { Package, Plus, DollarSign, TrendingUp, User, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Service } from "@/types";

import { db } from "@/lib/services";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    operational_cost: "",
    is_recurring: false,
    operational_responsible_id: ""
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await db.services.list();
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price);
    const operational_cost = parseFloat(formData.operational_cost);

    try {
      const margin = price - operational_cost;
      if (editingService) {
        await db.services.update(editingService.id, {
          ...formData,
          price,
          operational_cost,
          margin
        });
      } else {
        await db.services.create({
          ...formData,
          price,
          operational_cost,
          margin
        });
      }
      fetchServices();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar serviço.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir este serviço?")) {
      try {
        await db.services.delete(id);
        fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err);
      }
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category,
        price: service.price.toString(),
        operational_cost: service.operational_cost.toString(),
        is_recurring: service.is_recurring,
        operational_responsible_id: service.operational_responsible_id || ""
      });
    } else {
      setEditingService(null);
      setFormData({ name: "", category: "", price: "", operational_cost: "", is_recurring: false, operational_responsible_id: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight">Portfólio de Serviços</h3>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4">
        {services.map((s) => (
          <Card key={s.id} className="hover:border-primary/50 transition-colors group">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{s.name}</h4>
                    <p className="text-xs text-muted-foreground">{s.category}</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-around gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Preço</p>
                    <p className="text-sm font-bold">R$ {s.price.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Margem</p>
                    <p className="text-sm font-bold text-emerald-500">
                      {s.price > 0 ? (((s.price - s.operational_cost) / s.price) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Recorrência</p>
                    <Badge variant={s.is_recurring ? 'success' : 'outline'} className="mt-1">
                      {s.is_recurring ? 'Sim' : 'Único'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={() => openModal(s)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingService ? "Editar Serviço" : "Novo Serviço"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome do Serviço" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <Input label="Categoria" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Preço (R$)" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            <Input label="Custo Op. (R$)" type="number" value={formData.operational_cost} onChange={(e) => setFormData({...formData, operational_cost: e.target.value})} required />
          </div>
          <Input label="Responsável Operacional" value={formData.operational_responsible_id} onChange={(e) => setFormData({...formData, operational_responsible_id: e.target.value})} />
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="recurring" 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
            />
            <label htmlFor="recurring" className="text-sm font-medium">Serviço Recorrente (Assinatura)</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Serviço</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
