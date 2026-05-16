"use client";

import { Plus, Target, CheckSquare, FileText, Megaphone, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const projects = [
  { 
    id: "1", 
    name: "Lançamento Workshop Ansiedade", 
    type: "Lançamento", 
    status: "active",
    tasks: 12,
    tasks_done: 8,
    metrics: { leads: 150, cpl: "R$ 4,50" }
  },
  { 
    id: "2", 
    name: "Conteúdo Orgânico - Instagram", 
    type: "Conteúdo", 
    status: "active",
    tasks: 5,
    tasks_done: 5,
    metrics: { reach: "45k", eng: "8.5%" }
  },
  { 
    id: "3", 
    name: "Funil de Vendas Perpétuo", 
    type: "Funil de Vendas", 
    status: "paused",
    tasks: 20,
    tasks_done: 2,
    metrics: { sales: 0, roas: "0x" }
  },
];

export default function ClientProjects() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Projetos em Andamento</h3>
          <p className="text-sm text-muted-foreground">Gerencie as frentes de trabalho deste cliente.</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] uppercase">{project.type}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progresso das Tarefas</span>
                  <span>{project.tasks_done}/{project.tasks}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(project.tasks_done / project.tasks) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {Object.entries(project.metrics).map(([key, val], idx) => (
                  <div key={idx} className="bg-secondary/30 rounded-lg p-2 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{key}</p>
                    <p className="text-sm font-bold">{val}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 pt-4 border-t">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <CheckSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Megaphone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary ml-auto">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
