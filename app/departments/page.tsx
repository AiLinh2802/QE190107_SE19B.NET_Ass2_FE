"use client";

import Link from "next/link";
import { Building2, ChevronRight, FolderKanban, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Department } from "@/types";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>();
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.departments
      .list()
      .then(setItems)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  return (
    <div className="page max-w-6xl">
      <PageHeader
        eyebrow="Organization"
        title="Departments Directory"
        description="Browse all active organizational divisions and explore the ongoing projects led by each team."
        action={
          <Link className="btn-primary" href="/admin/departments">
            <Plus className="h-4 w-4" /> Manage Departments
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Loading department directory..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No active departments found"
          detail="Departments will appear here once they are added."
          action={
            <Link className="btn-primary" href="/admin/departments">
              Create Department
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.departmentId}
              href={`/departments/${item.departmentId}`}
              className="card card-hover group flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white shadow-xs">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {item.departmentName}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-3 min-h-16">
                  {item.departmentDescription}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-brand-600">
                <span className="flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4" /> View Projects
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
