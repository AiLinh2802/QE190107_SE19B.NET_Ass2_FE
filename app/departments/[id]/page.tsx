"use client";

import Link from "next/link";
import { ArrowLeft, Building2, CalendarDays, ChevronRight, FolderKanban, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DepartmentDetails } from "@/types";
import { EmptyState, ErrorState, LoadingState, ProjectStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/constants";

export default function DepartmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<DepartmentDetails>();
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.departments
      .get(id)
      .then(setItem)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  if (error)
    return (
      <div className="page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  if (!item)
    return (
      <div className="page">
        <LoadingState label="Loading department profile..." />
      </div>
    );

  return (
    <div className="page max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/departments"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> All Departments
        </Link>
        <Link href="/admin/departments" className="btn-secondary text-xs">
          Manage Departments
        </Link>
      </div>

      {/* Hero Card */}
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 text-white shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
          <Building2 className="h-4 w-4" />
          Department Profile
        </div>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl tracking-tight">{item.departmentName}</h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-300 text-base">{item.departmentDescription}</p>

        <div className="mt-8 flex items-center gap-3 border-t border-slate-800 pt-6">
          <div className="rounded-xl bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200">
            {item.projects.length} {item.projects.length === 1 ? "Linked Project" : "Linked Projects"}
          </div>
        </div>
      </section>

      {/* Department Projects */}
      <div className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <FolderKanban className="h-6 w-6 text-brand-600" />
              Department Projects
            </h2>
            <p className="text-xs text-slate-500 mt-1">Initiatives undertaken by {item.departmentName}</p>
          </div>

          <Link href="/admin/projects" className="btn-primary text-xs">
            <Plus className="h-3.5 w-3.5" /> New Project
          </Link>
        </div>

        {item.projects.length === 0 ? (
          <EmptyState
            title="No active projects in this department"
            detail="Assign or create a new project under this department to start tracking work."
            action={
              <Link href="/admin/projects" className="btn-primary">
                Create Project
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {item.projects.map((project) => (
              <Link
                key={project.projectId}
                href={`/projects/${project.projectId}`}
                className="card card-hover group flex flex-col justify-between p-6"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {project.projectName}
                    </h3>
                    <ProjectStatusBadge value={project.status} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 line-clamp-2">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(project.startDate)} → {project.endDate ? formatDate(project.endDate) : "Ongoing"}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
                    View project <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
