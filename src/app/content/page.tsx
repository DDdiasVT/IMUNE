import { ContentPipeline } from "@/components/content/ContentPipeline";
import { Button } from "@/components/ui/Button";
import { Plus, LayoutGrid, List } from "lucide-react";

export default function ContentPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Conteúdo</h2>
          <p className="text-muted-foreground">Planeje, produza e acompanhe suas postagens.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/50 rounded-lg p-1 border border-border">
            <Button variant="ghost" size="sm" className="h-8 px-2 bg-card shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Conteúdo
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ContentPipeline />
      </div>
    </div>
  );
}
