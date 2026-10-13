"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error";
type Toast = { id: number; message: string; type: ToastType };
const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed right-4 top-20 z-[70] flex w-[min(92vw,380px)] flex-col gap-3" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-soft ${toast.type === "success" ? "border-emerald-200" : "border-red-200"}`}>
            {toast.type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 text-red-600" />}
            <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
            <button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss"><X className="h-4 w-4 text-slate-400" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
