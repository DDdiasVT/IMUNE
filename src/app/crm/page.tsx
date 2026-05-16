import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CRMPage() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-6">
      {/* Header Fixo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CRM & Leads</h2>
          <p className="text-muted-foreground">Gerencie sua prospecção e funil de vendas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar lead..." 
              className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 w-[200px] md:w-[300px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Container do Kanban com Scroll Independente */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
