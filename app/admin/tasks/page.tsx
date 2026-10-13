"use client";

import { Calendar, Pencil, Plus, Search, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { TASK_PRIORITY, TASK_STATUS, formatDate } from "@/lib/constants";
import type { Project, Tag, TaskInput, TaskItem } from "@/types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageHeader,
  PriorityBadge,
  TagBadge,
  TaskStatusBadge,
} from "@/components/ui";
import { useToast } from "@/components/ToastProvider";

const blank: TaskInput = {
  title: "",
  description: "",
  status: 0,
  priority: 1,
  dueDate: "",
  projectId: 0,
  isActive: true,
  tagIds: [],
};

export default function AdminTasksPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<TaskItem[]>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const [editing, setEditing] = useState<TaskItem | null | undefined>();
  const [form, setForm] = useState<TaskInput>(blank);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<TaskItem>();

  const load = () => {
    setError("");
    Promise.all([api.tasks.list(), api.projects.list(), api.tags.list()])
      .then(([taskData, projectData, tagData]) => {
        setItems(taskData);
        setProjects(projectData);
        setTags(tagData);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    load();
  }, [router]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...blank, projectId: projects[0]?.projectId || 0 });
    setFormError("");
  };

  const openEdit = (item: TaskItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : "",
      projectId: item.projectId,
      isActive: item.isActive,
      tagIds: item.tags.map((tag) => tag.tagId),
    });
    setFormError("");
  };

  const toggleTag = (id: number) => {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(id)
        ? current.tagIds.filter((tagId) => tagId !== id)
        : [...current.tagIds, id],
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.projectId) {
      setFormError("Task title and project are required.");
      return;
    }
    setBusy(true);
    setFormError("");
    const payload = { ...form, description: form.description || null, dueDate: form.dueDate || null };
    try {
      if (editing) {
        await api.tasks.update(editing.taskId, payload);
      } else {
        await api.tasks.create(payload);
      }
      toast(`Task "${form.title}" ${editing ? "updated" : "created"} successfully.`);
      setEditing(undefined);
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.tasks.remove(deleting.taskId);
      toast(`Task "${deleting.title}" archived.`);
      setDeleting(undefined);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setBusy(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
    let list = items;
    if (statusFilter !== "ALL") {
      const s = Number(statusFilter);
      list = list.filter((t) => t.status === s);
    }
    if (priorityFilter !== "ALL") {
      const p = Number(priorityFilter);
      list = list.filter((t) => t.priority === p);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="page max-w-6xl">
      <PageHeader
        eyebrow="Protected Management"
        title="Manage Tasks"
        description="Create, assign, tag, and archive tasks across all active projects. Tasks are soft-deleted to maintain audit history."
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Task
          </button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Loading tasks..." />
      ) : (
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 text-xs sm:text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input sm:w-36 text-xs sm:text-sm"
              >
                <option value="ALL">All Statuses</option>
                {TASK_STATUS.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input sm:w-36 text-xs sm:text-sm"
              >
                <option value="ALL">All Priorities</option>
                {TASK_PRIORITY.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {items.length} tasks
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              title={items.length === 0 ? "No tasks found" : "No matching tasks"}
              detail={
                items.length === 0 ? "Create your first task to get started." : "Try adjusting your filters or search terms."
              }
              action={
                items.length === 0 ? (
                  <button className="btn-primary" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Add Task
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                      setPriorityFilter("ALL");
                    }}
                  >
                    Reset Filters
                  </button>
                )
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task & Tags</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.taskId}>
                      <td>
                        <div className="max-w-md">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          {item.createdByName && (
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Created by: {item.createdByName}</span>
                            </p>
                          )}
                          {item.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <TagBadge key={tag.tagId} tag={tag} />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-700 text-xs sm:text-sm">{item.projectName}</span>
                      </td>
                      <td>
                        <TaskStatusBadge value={item.status} />
                      </td>
                      <td>
                        <PriorityBadge value={item.priority} />
                      </td>
                      <td className="whitespace-nowrap text-xs text-slate-500">
                        {item.dueDate ? (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(item.dueDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No due date</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition"
                            onClick={() => openEdit(item)}
                            title="Edit task"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            onClick={() => setDeleting(item)}
                            title="Archive task"
                            aria-label="Archive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={editing !== undefined}
        title={editing ? "Edit Task" : "Create New Task"}
        onClose={() => setEditing(undefined)}
      >
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Task Title" required>
              <input
                className="input"
                maxLength={300}
                placeholder="e.g. Design responsive landing hero, Fix SSL connection"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                className="input min-h-24"
                placeholder="Detailed task description and acceptance criteria..."
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Project" required>
            <select
              className="input"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: Number(e.target.value) })}
            >
              <option value={0}>Select Project</option>
              {projects.map((item) => (
                <option key={item.projectId} value={item.projectId}>
                  {item.projectName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Due Date">
            <input
              type="date"
              className="input"
              value={form.dueDate || ""}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Field>

          <Field label="Status">
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            >
              {TASK_STATUS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority">
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            >
              {TASK_PRIORITY.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          {/* Tag Selection Multi-select */}
          <div className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Attach Tags
            </span>
            {tags.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tags created yet. You can create tags in Tag Management.</p>
            ) : (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.tagId);
                  const color = tag.color || "#64748B";
                  return (
                    <button
                      key={tag.tagId}
                      type="button"
                      onClick={() => toggleTag(tag.tagId)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                        selected
                          ? "border-slate-800 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      {tag.tagName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 sm:col-span-2">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setEditing(undefined)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : editing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Archive Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        title="Archive Task?"
        message={`Are you sure you want to archive "${deleting?.title}"? It will be soft-deleted (IsActive = false) and hidden from active views.`}
        busy={busy}
        onClose={() => setDeleting(undefined)}
        onConfirm={remove}
      />
    </div>
  );
}
