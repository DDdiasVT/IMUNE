"use client";

import { Plus, Filter, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ClientTasks({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [clientId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', clientId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Tarefas do Cliente</h3>
          <p className="text-sm text-muted-foreground">Gestão operacional focada.</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between p-4 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
                {task.status === 'done' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <h4 className={`text-sm font-medium ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>{task.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Prazo: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-border" />
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[9px] uppercase px-1.5 py-0">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
            {task.status !== 'done' && (
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-xs">
                Marcar como feita
              </Button>
            )}
          </Card>
        ))}

        {tasks.length === 0 && !loading && (
          <div className="py-20 text-center bg-secondary/10 rounded-xl border-2 border-dashed border-border/50">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Nenhuma tarefa pendente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
