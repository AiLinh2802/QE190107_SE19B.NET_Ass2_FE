"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FolderKanban,
  History,
  Tag as TagIcon,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TaskItem } from "@/types";
import { ErrorState, LoadingState, PriorityBadge, TagBadge, TaskStatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/constants";

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<TaskItem>();
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.tasks
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
        <LoadingState label="Loading task details..." />
      </div>
    );

  return (
    <div className="page max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/projects/${item.projectId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {item.projectName}
        </Link>
        <Link href="/admin/tasks" className="btn-secondary text-xs">
          <Edit className="h-3.5 w-3.5" /> Manage Tasks
        </Link>
      </div>

      <article className="card p-7 sm:p-10 shadow-soft bg-white">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start border-b border-slate-100 pb-7">
          <div>
            <Link
              href={`/projects/${item.projectId}`}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 hover:underline"
            >
              <FolderKanban className="h-4 w-4" />
              {item.projectName}
            </Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {item.title}
            </h1>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <TaskStatusBadge value={item.status} />
            <PriorityBadge value={item.priority} />
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Description</h2>
          <div className="mt-3 rounded-2xl bg-slate-50/70 p-5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap border border-slate-100">
            {item.description || "No description provided for this task."}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className={`mt-8 grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 ${item.createdByName ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          <InfoCard
            icon={<Calendar className="h-5 w-5 text-blue-600" />}
            label="Due Date"
            value={formatDate(item.dueDate)}
          />
          <InfoCard
            icon={<Clock className="h-5 w-5 text-emerald-600" />}
            label="Date Created"
            value={formatDate(item.createdDate.slice(0, 10))}
          />
          <InfoCard
            icon={<History className="h-5 w-5 text-amber-600" />}
            label="Last Modified"
            value={item.modifiedDate ? formatDate(item.modifiedDate.slice(0, 10)) : "Original Version"}
          />
          {item.createdByName && (
            <InfoCard
              icon={<User className="h-5 w-5 text-indigo-600" />}
              label="Created By"
              value={item.createdByName}
            />
          )}
        </div>

        {/* Tags Section */}
        <div className="mt-8 border-t border-slate-100 pt-7">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TagIcon className="h-3.5 w-3.5" />
            Associated Tags
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.length > 0 ? (
              item.tags.map((tag) => <TagBadge key={tag.tagId} tag={tag} />)
            ) : (
              <span className="text-xs text-slate-400 italic">No tags attached to this task</span>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
