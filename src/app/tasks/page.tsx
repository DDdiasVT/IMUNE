"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, Plus, Filter, Search, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Task, Client } from "@/types";

import { db } from "@/lib/services";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
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
      const [tasksData, clientsData] = await Promise.all([
        db.tasks.list(),
        db.clients.list()
      ]);
      setTasks(tasksData);
      setClients(clientsData);
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
          assigned_to: "Joao Vitor",
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tarefas</h2>
          <p className="text-muted-foreground">Mantenha a operação em dia e não perca prazos.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const client = clients.find(c => c.id === task.client_id);
          return (
            <Card key={task.id} className="flex items-center justify-between p-4 hover:border-primary/50 transition-colors group">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleStatus(task)} className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary'
                }`}>
                  {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div>
                  <h4 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-primary font-bold">{client?.name || 'Agência'}</span>
                    <div className="h-1 w-1 rounded-full bg-border" />
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 uppercase">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => openModal(task)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete(task.id)}>
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
          <div className="grid grid-cols-2 gap-4">
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
