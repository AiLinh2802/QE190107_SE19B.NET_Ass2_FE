"use client";

import Link from "next/link";
import {
  Calendar,
  ChevronRight,
  Filter,
  FolderKanban,
  RotateCcw,
  Search as SearchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Project, Tag, TaskItem } from "@/types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PriorityBadge,
  TagBadge,
  TaskStatusBadge,
} from "@/components/ui";
import { TASK_PRIORITY, TASK_STATUS, formatDate } from "@/lib/constants";

export default function SearchPage() {
  const [tasks, setTasks] = useState<TaskItem[]>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ title: "", status: "", priority: "", projectId: "", tagId: "" });

  useEffect(() => {
    Promise.all([api.projects.list(), api.tags.list()])
      .then(([p, t]) => {
        setProjects(p);
        setTags(t);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => value && query.set(key, value));
      setError("");
      api.tasks
        .search(query)
        .then(setTasks)
        .catch((e) => setError(e.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const update = (key: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const resetFilters = () => {
    setFilters({ title: "", status: "", priority: "", projectId: "", tagId: "" });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="page max-w-6xl">
      <PageHeader
        eyebrow="Query & Discovery"
        title="Search & Filter Tasks"
        description="Filter tasks by any combination of title, status, priority level, department project, or attached tags."
        action={
          hasActiveFilters && (
            <button onClick={resetFilters} className="btn-secondary text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </button>
          )
        }
      />

      {/* Filter Toolbar */}
      <section className="card p-5 mb-8 shadow-soft border-slate-200/90 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="h-3.5 w-3.5 text-brand-600" />
            Filter Criteria
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Keyword Search */}
          <div className="relative lg:col-span-1">
            <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              className="input pl-10 text-xs sm:text-sm"
              placeholder="Search by title..."
              value={filters.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <Select
            value={filters.status}
            onChange={(v) => update("status", v)}
            label="All Statuses"
            options={TASK_STATUS}
          />

          {/* Priority Dropdown */}
          <Select
            value={filters.priority}
            onChange={(v) => update("priority", v)}
            label="All Priorities"
            options={TASK_PRIORITY}
          />

          {/* Project Dropdown */}
          <select
            className="input text-xs sm:text-sm"
            value={filters.projectId}
            onChange={(e) => update("projectId", e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>

          {/* Tag Dropdown */}
          <select
            className="input text-xs sm:text-sm"
            value={filters.tagId}
            onChange={(e) => update("tagId", e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.tagId} value={tag.tagId}>
                {tag.tagName}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Results Header */}
      {tasks && (
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Found <strong className="text-slate-900">{tasks.length}</strong> matching{" "}
            {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>
      )}

      {/* Results List */}
      {error ? (
        <ErrorState message={error} />
      ) : !tasks ? (
        <LoadingState label="Filtering tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match these criteria"
          detail="Try adjusting or clearing your search filters to see more results."
          action={
            hasActiveFilters && (
              <button onClick={resetFilters} className="btn-secondary">
                Reset All Filters
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3.5">
          {tasks.map((task) => (
            <Link
              key={task.taskId}
              href={`/tasks/${task.taskId}`}
              className="card card-hover group flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
                  <FolderKanban className="h-3.5 w-3.5" />
                  {task.projectName}
                </p>
                <h2 className="mt-1 text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {task.title}
                </h2>
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
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(task.dueDate)}
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
  );
}

function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
}) {
  return (
    <select className="input text-xs sm:text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {options.map((option, index) => (
        <option key={option} value={index}>
          {option}
        </option>
      ))}
    </select>
  );
}
