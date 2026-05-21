"use client";

import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function CRMPage() {
  const { profile, isClient } = useAuth();

  // Clientes veem apenas os leads do próprio client_id
  const clientId = isClient ? (profile?.client_id ?? undefined) : undefined;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">CRM & Leads</h2>
          <p className="text-muted-foreground">Gerencie sua prospecção e funil de vendas.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar lead..."
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 md:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard clientId={clientId} />
      </div>
    </div>
  );
}
