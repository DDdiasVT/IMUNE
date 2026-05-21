"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Task } from "@/types";
import { db } from "@/lib/services";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientTasks({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Task['priority'],
    status: "pending" as Task['status'],
  });

  useEffect(() => { fetchTasks(); }, [clientId]);

  const fetchTasks = async () => {
    try {
      const all = await db.tasks.list();
      setTasks(all.filter((t) => t.client_id === clientId));
    } catch (err) {
      console.error(err);
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
          client_id: clientId,
          assigned_to: profile?.full_name || null,
        });
      }
      fetchTasks();
      closeModal();
    } catch {
      alert("Erro ao salvar tarefa.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir tarefa?")) {
      try { await db.tasks.delete(id); fetchTasks(); }
      catch (err) { console.error(err); }
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await db.tasks.update(task.id, { status: newStatus as Task['status'] });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({ title: task.title, description: task.description || "", priority: task.priority, status: task.status });
    } else {
      setEditingTask(null);
      setFormData({ title: "", description: "", priority: "medium", status: "pending" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingTask(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Tarefas do Cliente</h3>
          <p className="text-sm text-muted-foreground">Gestão operacional focada.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between p-4 hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => toggleStatus(task)}
                className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  task.status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-secondary"
                }`}
              >
                {task.status === "completed"
                  ? <CheckCircle2 className="h-5 w-5" />
                  : <Clock className="h-5 w-5 text-muted-foreground" />}
              </button>
              <div className="min-w-0">
                <h4 className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {task.due_date && (
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      Prazo: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-[9px] uppercase px-1.5 py-0">
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
        ))}

        {tasks.length === 0 && !loading && (
          <div className="py-20 text-center bg-secondary/10 rounded-xl border-2 border-dashed border-border/50">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Nenhuma tarefa ainda.</p>
            <Button size="sm" className="mt-4 gap-2" onClick={() => openModal()}>
              <Plus className="h-4 w-4" /> Criar primeira tarefa
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? "Editar Tarefa" : "Nova Tarefa"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título da Tarefa" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <Input label="Descrição (opcional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground ml-1">Prioridade</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
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
