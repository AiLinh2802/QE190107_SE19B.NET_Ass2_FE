"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  LoaderCircle,
  PauseCircle,
  PlayCircle,
  X,
  XCircle,
} from "lucide-react";
import type { Tag } from "@/types";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.2em] text-brand-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-slate-600 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading information..." }: { label?: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-500">
        <LoaderCircle className="h-7 w-7 animate-spin text-brand-600" />
        <span className="animate-pulse">{label}</span>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="font-bold text-rose-900 text-base">{message}</p>
      <p className="mt-1 text-xs text-rose-700">Please check your connection and try again.</p>
      {onRetry && (
        <button className="btn-secondary mt-5 border-rose-200 text-rose-700 hover:bg-rose-100" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-12 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <HelpCircle className="h-6 w-6" />
      </div>
      <p className="font-bold text-slate-800 text-base">{title}</p>
      {detail && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{detail}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ==================== BADGES ==================== */

export function ProjectStatusBadge({ value }: { value: number }) {
  // 0: Not Started, 1: In Progress, 2: Completed, 3: On Hold
  const configs: Record<number, { label: string; bg: string; text: string; dot: string; icon: typeof Clock }> = {
    0: { label: "Not Started", bg: "bg-slate-100 border-slate-200", text: "text-slate-700", dot: "bg-slate-400", icon: Clock },
    1: { label: "In Progress", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-500", icon: PlayCircle },
    2: { label: "Completed", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle2 },
    3: { label: "On Hold", bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500", icon: PauseCircle },
  };
  const config = configs[value] || configs[0];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-tight shadow-2xs ${config.bg} ${config.text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function TaskStatusBadge({ value }: { value: number }) {
  // 0: To Do, 1: In Progress, 2: Done, 3: Cancelled
  const configs: Record<number, { label: string; bg: string; text: string; icon: typeof Clock }> = {
    0: { label: "To Do", bg: "bg-slate-100 border-slate-200", text: "text-slate-700", icon: Clock },
    1: { label: "In Progress", bg: "bg-sky-50 border-sky-200", text: "text-sky-700", icon: PlayCircle },
    2: { label: "Done", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
    3: { label: "Cancelled", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle },
  };
  const config = configs[value] || configs[0];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-tight shadow-2xs ${config.bg} ${config.text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ value }: { value: number }) {
  // 0: Low, 1: Medium, 2: High, 3: Critical
  const configs: Record<number, { label: string; bg: string; text: string; icon: typeof AlertCircle }> = {
    0: { label: "Low", bg: "bg-slate-100 text-slate-600 border-slate-200", text: "text-slate-600", icon: Clock },
    1: { label: "Medium", bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", icon: AlertCircle },
    2: { label: "High", bg: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-700", icon: AlertCircle },
    3: { label: "Critical", bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-700", icon: AlertTriangle },
  };
  const config = configs[value] || configs[1];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold shadow-2xs ${config.bg}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

export function TagBadge({ tag }: { tag: Tag }) {
  const color = tag.color || "#64748B";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-2xs transition hover:opacity-90"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {tag.tagName}
    </span>
  );
}

/* ==================== DIALOGS & FORMS ==================== */

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm leading-relaxed text-slate-600">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button className="btn-danger" onClick={onConfirm} disabled={busy}>
              {busy ? "Processing..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function Field({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}
