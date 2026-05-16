"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Megaphone, 
  FileText, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  BookOpen,
  Settings,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Clientes", href: "/clients" },
  { icon: Kanban, label: "CRM", href: "/crm" },
  { icon: Megaphone, label: "Campanhas", href: "/campaigns" },
  { icon: FileText, label: "Conteúdo", href: "/content" },
  { icon: CheckSquare, label: "Tarefas", href: "/tasks" },
  { icon: ShoppingBag, label: "Comercial", href: "/commercial" },
  { icon: DollarSign, label: "Financeiro", href: "/finance" },
  { icon: BarChart3, label: "Métricas", href: "/metrics" },
  { icon: Calendar, label: "Calendário", href: "/calendar" },
  { icon: BookOpen, label: "Base de Conhecimento", href: "/wiki" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isClient } = useAuth();

  const filteredMenuItems = menuItems.filter(item => {
    if (isClient) {
      return ["Dashboard", "Campanhas", "Métricas", "Conteúdo"].includes(item.label);
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-card border-r w-64 fixed left-0 top-0 overflow-y-auto scrollbar-hide">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
          <div className="h-4 w-4 bg-white rounded-full animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tighter text-white leading-tight">IMUNE</h1>
          <p className="text-[9px] uppercase tracking-widest text-primary font-bold">Performance OS</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 pb-10">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-transform group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary w-full transition-colors">
          <Settings className="h-4 w-4" />
          Configurações
        </button>
      </div>
    </div>
  );
}
