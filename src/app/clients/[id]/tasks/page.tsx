"use client";

import { Plus, Filter, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const tasks = [
  { id: 1, title: "Roteirizar Reels de Burnout", project: "Conteúdo Orgânico", priority: "high", due: "Hoje", status: "pending" },
  { id: 2, title: "Subir criativos Captação", project: "Lançamento Workshop", priority: "high", due: "Amanhã", status: "in_progress" },
  { id: 3, title: "Revisar copy da landing page", project: "Lançamento Workshop", priority: "medium", due: "15 Out", status: "pending" },
];

export default function ClientTasks() {
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{task.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-primary font-bold">{task.project}</span>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-xs text-muted-foreground">Prazo: {task.due}</span>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              Concluir
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
