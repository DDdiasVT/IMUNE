import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border-t sm:border border-border w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="h-1 w-10 bg-muted-foreground/30 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b shrink-0">
          <h3 className="text-base sm:text-xl font-bold tracking-tight">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
