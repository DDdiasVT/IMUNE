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
        <h2 className="text-3xl font-bold tracking-tight">Área Comercial</h2>
        <p className="text-muted-foreground">Gestão de vendas, metas, comissões e performance do time.</p>
      </div>

      <div className="flex items-center gap-1 border-b pb-px overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
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
