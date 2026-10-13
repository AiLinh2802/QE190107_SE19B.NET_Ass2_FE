"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  FolderKanban,
  ListTodo,
  Plus,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { ProjectDetails } from "@/types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PriorityBadge,
  ProjectStatusBadge,
  TagBadge,
  TaskStatusBadge,
} from "@/components/ui";
import { formatDate } from "@/lib/constants";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ProjectDetails>();
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "ALL">("ALL");

  const load = () => {
    setError("");
    api.projects
      .get(id)
      .then(setItem)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const taskStats = useMemo(() => {
    if (!item) return { total: 0, todo: 0, inProgress: 0, done: 0, cancelled: 0 };
    return {
      total: item.tasks.length,
      todo: item.tasks.filter((t) => t.status === 0).length,
      inProgress: item.tasks.filter((t) => t.status === 1).length,
      done: item.tasks.filter((t) => t.status === 2).length,
      cancelled: item.tasks.filter((t) => t.status === 3).length,
    };
  }, [item]);

  const filteredTasks = useMemo(() => {
    if (!item) return [];
    if (statusFilter === "ALL") return item.tasks;
    return item.tasks.filter((t) => t.status === statusFilter);
  }, [item, statusFilter]);

  if (error)
    return (
      <div className="page">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  if (!item)
    return (
      <div className="page">
        <LoadingState label="Loading project details..." />
      </div>
    );

  const filterTabs = [
    { key: "ALL" as const, label: "All Tasks", count: taskStats.total },
    { key: 0, label: "To Do", count: taskStats.todo },
    { key: 1, label: "In Progress", count: taskStats.inProgress },
    { key: 2, label: "Done", count: taskStats.done },
    { key: 3, label: "Cancelled", count: taskStats.cancelled },
  ];

  return (
    <div className="page max-w-6xl">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/departments/${item.departmentId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {item.departmentName}
        </Link>
        <Link href={`/admin/projects`} className="btn-secondary text-xs">
          Edit Project
        </Link>
      </div>

      {/* Project Hero Card */}
      <section className="card p-7 sm:p-9 shadow-soft bg-gradient-to-br from-white to-slate-50/50">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <FolderKanban className="h-4 w-4" />
              {item.departmentName}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {item.projectName}
            </h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
              {item.description || "No project description provided."}
            </p>
          </div>
          <div className="shrink-0">
            <ProjectStatusBadge value={item.status} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-slate-200/80 pt-6 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-600" />
            <span>
              Start: <strong className="text-slate-900">{formatDate(item.startDate)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-600" />
            <span>
              Target End:{" "}
              <strong className="text-slate-900">
                {item.endDate ? formatDate(item.endDate) : "Ongoing / Flexible"}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              Progress:{" "}
              <strong className="text-slate-900">
                {taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0}% completed
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Tasks Section with Bonus Status Filter */}
      <div className="mt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <ListTodo className="h-6 w-6 text-brand-600" />
              Project Tasks
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {filteredTasks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Filter tasks by state or view pipeline progress</p>
          </div>

          <Link href="/admin/tasks" className="btn-primary text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Task
          </Link>
        </div>

        {/* Status Filter Tabs (Bonus Feature) */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <div className="mr-2 flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={String(tab.key)}
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-150 ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Task List */}
        <div className="mt-6">
          {filteredTasks.length === 0 ? (
            <EmptyState
              title={statusFilter === "ALL" ? "No tasks in this project yet" : "No tasks match this filter"}
              detail={
                statusFilter === "ALL"
                  ? "Create the first task to begin tracking work for this project."
                  : "Try switching to another tab or selecting 'All Tasks'."
              }
              action={
                statusFilter === "ALL" ? (
                  <Link href="/admin/tasks" className="btn-primary">
                    <Plus className="h-4 w-4" /> Create Task
                  </Link>
                ) : (
                  <button onClick={() => setStatusFilter("ALL")} className="btn-secondary">
                    Show All Tasks
                  </button>
                )
              }
            />
          ) : (
            <div className="space-y-3.5">
              {filteredTasks.map((task) => (
                <Link
                  key={task.taskId}
                  href={`/tasks/${task.taskId}`}
                  className="card card-hover group flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-1">{task.description}</p>
                    )}
                    {task.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {task.tags.map((tag) => (
                          <TagBadge key={tag.tagId} tag={tag} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <TaskStatusBadge value={task.status} />
                    <PriorityBadge value={task.priority} />
                    {task.dueDate && (
                      <span className="text-xs font-semibold text-slate-500">
                        Due: {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
