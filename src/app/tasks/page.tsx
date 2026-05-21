"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Plus, Trash2, Edit2, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Task, Client } from "@/types";

import { db } from "@/lib/services";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function TasksPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Task['priority'],
    status: "pending" as Task['status'],
    client_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, clientsData, campsRes] = await Promise.all([
        db.tasks.list(),
        db.clients.list(),
        supabase.from("campaigns").select("id, name"),
      ]);
      setTasks(tasksData);
      setClients(clientsData);
      setCampaigns(campsRes.data || []);
    } catch (err) {
      console.error("Error fetching tasks data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await db.tasks.update(editingTask.id, formData);
      } else {
        await db.tasks.create({
          ...formData,
          assigned_to: profile?.full_name || null,
        });
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert("Erro ao salvar tarefa.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir tarefa?")) {
      try {
        await db.tasks.delete(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await db.tasks.update(task.id, { status: newStatus as any });
      fetchData();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        client_id: task.client_id || ""
      });
    } else {
      setEditingTask(null);
      setFormData({ title: "", description: "", priority: "medium", status: "pending", client_id: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tarefas</h2>
          <p className="text-muted-foreground">Mantenha a operação em dia e não perca prazos.</p>
        </div>
        <Button size="sm" className="gap-2 w-full sm:w-auto justify-center" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const client = clients.find(c => c.id === task.client_id);
          return (
            <Card key={task.id} className="flex items-center justify-between p-4 hover:border-primary/50 transition-colors group">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <button onClick={() => toggleStatus(task)} className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary'
                }`}>
                  {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="min-w-0">
                  <h4 className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-primary font-bold">{client?.name || 'Agência'}</span>
                    {(task as any).campaign_id && (() => {
                      const camp = campaigns.find(c => c.id === (task as any).campaign_id);
                      return camp ? (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">
                          <Megaphone className="h-2.5 w-2.5" />
                          {camp.name}
                        </span>
                      ) : null;
                    })()}
                    <div className="h-1 w-1 rounded-full bg-border hidden sm:block" />
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 uppercase hidden sm:flex">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={() => openModal(task)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-destructive transition-opacity" onClick={() => handleDelete(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? "Editar Tarefa" : "Nova Tarefa"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título da Tarefa" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Cliente</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
            >
              <option value="">Agência (Interno)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">Prioridade</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">Status</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar Tarefa</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
