"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const events = [
  { day: 15, title: "Reunião de Alinhamento", type: "meeting" },
  { day: 15, title: "Post: Lançamento", type: "post" },
  { day: 18, title: "Gravação de Reels", type: "video" },
  { day: 20, title: "Campanha Black Friday", type: "campaign" },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Calendário Editorial</h2>
          <p className="text-muted-foreground">Visualize entregas e eventos de forma organizada.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary/50 rounded-lg border border-border">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 text-sm font-medium">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-border/50">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-7 border-b">
            {days.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5 h-[calc(100vh-350px)]">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 2; // Offset to start Oct 2024 on Tuesday
              const isCurrentMonth = dayNum > 0 && dayNum <= 31;
              const dayEvents = events.filter(e => e.day === dayNum);

              return (
                <div key={i} className={`border-r border-b p-2 hover:bg-secondary/20 transition-colors ${!isCurrentMonth ? 'bg-muted/10' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${dayNum === 15 ? 'bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center' : 'text-muted-foreground'}`}>
                      {isCurrentMonth ? dayNum : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event, idx) => (
                      <div key={idx} className="text-[10px] p-1 rounded bg-primary/10 text-primary border border-primary/20 truncate">
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
