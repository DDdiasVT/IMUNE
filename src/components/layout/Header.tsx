"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const toggleSidebar = () => {
    document.getElementById('sidebar')?.classList.remove('-translate-x-full');
    document.getElementById('sidebar-overlay')?.classList.remove('hidden');
  };

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
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">Joao Vitor</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
