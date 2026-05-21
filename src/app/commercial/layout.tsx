"use client";

import { usePathname } from "next/navigation";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  Target, 
  Trophy, 
  DollarSign 
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function CommercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: "Vendedores", href: "/commercial", icon: Users },
    { label: "Vendas", href: "/commercial/sales", icon: ShoppingBag },
    { label: "Serviços", href: "/commercial/services", icon: Package },
    { label: "Metas & Ranking", href: "/commercial/ranking", icon: Trophy },
    { label: "Comissões", href: "/commercial/commissions", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Área Comercial</h2>
        <p className="text-muted-foreground">Gestão de vendas, metas, comissões e performance do time.</p>
      </div>

      <div className="relative">
        <div className="flex items-center gap-1 border-b pb-px overflow-x-auto scrollbar-hide whitespace-nowrap">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all border-b-2 shrink-0",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      <div className="py-4">
        {children}
      </div>
    </div>
  );
}
