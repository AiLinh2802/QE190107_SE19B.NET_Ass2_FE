"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  FolderKanban,
  ListTodo,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Department, Project, TaskItem } from "@/types";
import { EmptyState, ErrorState, LoadingState, ProjectStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/constants";

export default function HomePage() {
  const [data, setData] = useState<{ departments: Department[]; projects: Project[]; tasks: TaskItem[] }>();
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([api.departments.list(), api.projects.list(), api.tasks.list()])
      .then(([departments, projects, tasks]) => setData({ departments, projects, tasks }))
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  if (error)
    return (
      <div className="page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  if (!data)
    return (
      <div className="page">
        <LoadingState label="Loading workspace overview..." />
      </div>
    );

  const completedProjects = data.projects.filter((p) => p.status === 2).length;
  const inProgressProjects = data.projects.filter((p) => p.status === 1).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent pointer-events-none" />
        <div className="page relative py-12 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-2xs mb-6">
                <Sparkles className="h-3.5 w-3.5 text-brand-500 animate-pulse" />
                PRN232 Task Management System
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
                Coordinate teams and projects with{" "}
                <span className="bg-gradient-to-r from-brand-600 to-sky-600 bg-clip-text text-transparent">
                  effortless clarity.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-slate-600 leading-relaxed">
                A centralized, public workspace to manage departments, monitor project milestones, and track tasks
                without barriers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link href="/admin/projects" className="btn-primary">
                  <Plus className="h-4 w-4" /> Manage Projects
                </Link>
                <Link href="/departments" className="btn-secondary">
                  Explore Departments <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/search" className="btn-ghost">
                  <Search className="h-4 w-4" /> Search Tasks
                </Link>
              </div>
            </div>

            {/* Metrics Snapshot Card */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace Snapshot</p>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Database
                </span>
              </div>

              <div className="mt-6 grid gap-3.5">
                <MetricRow
                  icon={Building2}
                  iconBg="bg-blue-500/20 text-blue-400"
                  value={data.departments.length}
                  label="Active Departments"
                  sub="Operational divisions"
                />
                <MetricRow
                  icon={FolderKanban}
                  iconBg="bg-brand-500/20 text-brand-400"
                  value={data.projects.length}
                  label="Total Projects"
                  sub={`${inProgressProjects} In Progress · ${completedProjects} Done`}
                />
                <MetricRow
                  icon={ListTodo}
                  iconBg="bg-emerald-500/20 text-emerald-400"
                  value={data.tasks.length}
                  label="Tracked Tasks"
                  sub="Active items in pipeline"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="page mt-4">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Overview
            </div>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Active Projects</h2>
            <p className="mt-1 text-sm text-slate-500">Explore ongoing initiatives across all departments</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/projects" className="btn-secondary text-xs">
              <Plus className="h-3.5 w-3.5" /> New Project
            </Link>
          </div>
        </div>

        {data.projects.length === 0 ? (
          <EmptyState
            title="No active projects found"
            detail="Get started by creating your first project in the management dashboard."
            action={
              <Link href="/admin/projects" className="btn-primary">
                Create Project
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project) => (
              <Link
                key={project.projectId}
                href={`/projects/${project.projectId}`}
                className="card card-hover group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                      {project.departmentName}
                    </span>
                    <ProjectStatusBadge value={project.status} />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {project.projectName}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2 min-h-11">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(project.startDate)}
                  </span>
                  <span className="flex items-center gap-1 text-brand-600 font-bold group-hover:translate-x-1 transition-transform">
                    View tasks <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  iconBg,
  value,
  label,
  sub,
}: {
  icon: typeof Building2;
  iconBg: string;
  value: number;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5 transition hover:bg-white/10">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconBg}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{value}</span>
          <span className="text-sm font-semibold text-slate-200">{label}</span>
        </div>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}
