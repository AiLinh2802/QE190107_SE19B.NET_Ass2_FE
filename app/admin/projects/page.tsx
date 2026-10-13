"use client";

import { Calendar, FolderKanban, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { PROJECT_STATUS, formatDate } from "@/lib/constants";
import type { Department, Project, ProjectInput } from "@/types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageHeader,
  ProjectStatusBadge,
} from "@/components/ui";
import { useToast } from "@/components/ToastProvider";

const blank: ProjectInput = {
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  status: 0,
  departmentId: 0,
  isActive: true,
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Project[]>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [editing, setEditing] = useState<Project | null | undefined>();
  const [form, setForm] = useState<ProjectInput>(blank);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Project>();

  const load = () => {
    setError("");
    Promise.all([api.projects.list(), api.departments.list()])
      .then(([projects, deps]) => {
        setItems(projects);
        setDepartments(deps);
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
    setForm({ ...blank, departmentId: departments[0]?.departmentId || 0 });
    setFormError("");
  };

  const openEdit = (item: Project) => {
    setEditing(item);
    setForm({
      projectName: item.projectName,
      description: item.description || "",
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      status: item.status,
      departmentId: item.departmentId,
      isActive: item.isActive,
    });
    setFormError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.projectName.trim() || !form.startDate || !form.departmentId) {
      setFormError("Project name, start date, and department are required.");
      return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      setFormError("End date must be on or after start date.");
      return;
    }
    setBusy(true);
    setFormError("");
    const payload = { ...form, description: form.description || null, endDate: form.endDate || null };
    try {
      if (editing) {
        await api.projects.update(editing.projectId, payload);
      } else {
        await api.projects.create(payload);
      }
      toast(`Project "${form.projectName}" ${editing ? "updated" : "created"} successfully.`);
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
      await api.projects.remove(deleting.projectId);
      toast(`Project "${deleting.projectName}" deleted.`);
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
      const targetStatus = Number(statusFilter);
      list = list.filter((p) => p.status === targetStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          p.departmentName.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, searchQuery, statusFilter]);

  return (
    <div className="page max-w-6xl">
      <PageHeader
        eyebrow="Protected Management"
        title="Manage Projects"
        description="Oversee projects, configure timelines, and track progress. Projects linked to active tasks cannot be deleted."
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Loading projects..." />
      ) : (
        <div className="space-y-4">
          {/* Quick Filter Bar */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by project or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 text-xs sm:text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input sm:w-44 text-xs sm:text-sm"
              >
                <option value="ALL">All Statuses</option>
                {PROJECT_STATUS.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {items.length} projects
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              title={items.length === 0 ? "No projects found" : "No matching projects"}
              detail={
                items.length === 0 ? "Create your first project to begin." : "Try adjusting your search query or status filter."
              }
              action={
                items.length === 0 ? (
                  <button className="btn-primary" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Add Project
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
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
                    <th>Project</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Timeline</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.projectId}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-600">
                            <FolderKanban className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{item.projectName}</p>
                            {item.description && (
                              <p className="max-w-xs truncate text-xs text-slate-400">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {item.departmentName}
                        </span>
                      </td>
                      <td>
                        <ProjectStatusBadge value={item.status} />
                      </td>
                      <td className="whitespace-nowrap text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(item.startDate)} → {item.endDate ? formatDate(item.endDate) : "Ongoing"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition"
                            onClick={() => openEdit(item)}
                            title="Edit project"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            onClick={() => setDeleting(item)}
                            title="Delete project"
                            aria-label="Delete"
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
        title={editing ? "Edit Project" : "Create New Project"}
        onClose={() => setEditing(undefined)}
      >
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Project Name" required>
              <input
                className="input"
                maxLength={200}
                placeholder="e.g. Mobile App V2, Cloud Migration"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Department" required>
            <select
              className="input"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })}
            >
              <option value={0}>Select department</option>
              {departments.map((item) => (
                <option key={item.departmentId} value={item.departmentId}>
                  {item.departmentName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            >
              {PROJECT_STATUS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                className="input min-h-24"
                placeholder="Brief summary of project goals..."
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Start Date" required>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>

          <Field label="Target End Date">
            <input
              type="date"
              className="input"
              value={form.endDate || ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>

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
              {busy ? "Saving..." : editing ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Project?"
        message={`Delete "${deleting?.projectName}"? Note: In accordance with business rules, projects with linked tasks cannot be deleted.`}
        busy={busy}
        onClose={() => setDeleting(undefined)}
        onConfirm={remove}
      />
    </div>
  );
}
