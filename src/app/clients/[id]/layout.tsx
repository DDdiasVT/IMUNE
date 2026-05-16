"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Target, 
  FileText, 
  CheckSquare, 
  Megaphone,
  Info,
  Settings,
  ChevronLeft,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { clsx } from "clsx";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ClientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const pathname = usePathname();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const fetchClient = async () => {
      const { data } = await supabase.from('clients').select('*').eq('id', id).single();
      setClient(data);
    };
    fetchClient();
  }, [id]);

  const tabs = [
    { label: "Visão Geral", href: `/clients/${id}`, icon: LayoutDashboard },
    { label: "Projetos", href: `/clients/${id}/projects`, icon: Target },
    { label: "Campanhas", href: `/clients/${id}/campaigns`, icon: Megaphone },
    { label: "Conteúdo", href: `/clients/${id}/content`, icon: FileText },
    { label: "Tarefas", href: `/clients/${id}/tasks`, icon: CheckSquare },
    { label: "Dados do Cliente", href: `/clients/${id}/info`, icon: Info },
    { label: "Acessos", href: `/clients/${id}/access`, icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/clients")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{client?.name || "Carregando..."}</h2>
            <p className="text-sm text-muted-foreground">{client?.niche || "Consultoria"} • {client?.status === 'active' ? 'Ativo' : 'Pausado'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b pb-px overflow-x-auto scrollbar-hide whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2",
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="py-4">
        {children}
      </div>
    </div>
  );
}
