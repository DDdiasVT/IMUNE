"use client";

import { Plus, Target, CheckSquare, FileText, Megaphone, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ClientProjects({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = React.use(params);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [clientId]);

  const fetchProjects = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').eq('client_id', clientId),
        supabase.from('tasks').select('*').eq('client_id', clientId)
      ]);

      const projectsData = projectsRes.data || [];
      const tasksData = tasksRes.data || [];

      const enrichedProjects = projectsData.map(proj => {
        const projTasks = tasksData.filter(t => t.project_id === proj.id);
        const doneTasks = projTasks.filter(t => t.status === 'done');
        return {
          ...proj,
          tasks_count: projTasks.length,
          tasks_done: doneTasks.length
        };
      });

      setProjects(enrichedProjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest">{project.type || 'Geral'}</Badge>
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
                  <span>{project.tasks_done}/{project.tasks_count}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(project.tasks_done / (project.tasks_count || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 pt-4 border-t">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <CheckSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary ml-auto">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center bg-secondary/10 rounded-xl border-2 border-dashed border-border/50">
            <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground italic">Nenhum projeto registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
