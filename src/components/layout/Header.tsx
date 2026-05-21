"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { profile } = useAuth();

  const toggleSidebar = () => {
    document.getElementById('sidebar')?.classList.remove('-translate-x-full');
    document.getElementById('sidebar-overlay')?.classList.remove('hidden');
  };

  const roleLabel = profile?.role === 'admin' ? 'Admin' : profile?.role === 'client' ? 'Cliente' : 'Membro';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="hidden md:flex w-full max-w-sm items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="flex items-center gap-2 sm:gap-3 border-l pl-3 sm:pl-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none">{profile?.full_name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
