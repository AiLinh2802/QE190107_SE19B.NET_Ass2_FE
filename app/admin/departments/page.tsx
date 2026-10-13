"use client";

import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Department, DepartmentInput } from "@/types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageHeader,
} from "@/components/ui";
import { useToast } from "@/components/ToastProvider";

const blank: DepartmentInput = { departmentName: "", departmentDescription: "", isActive: true };

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Department[]>();
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editing, setEditing] = useState<Department | null | undefined>();
  const [form, setForm] = useState(blank);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Department>();

  const load = () => {
    setError("");
    api.departments
      .list()
      .then(setItems)
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
    setForm(blank);
    setFormError("");
  };

  const openEdit = (item: Department) => {
    setEditing(item);
    setForm({
      departmentName: item.departmentName,
      departmentDescription: item.departmentDescription,
      isActive: item.isActive,
    });
    setFormError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.departmentName.trim() || !form.departmentDescription.trim()) {
      setFormError("Department name and description are required.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      if (editing) {
        await api.departments.update(editing.departmentId, form);
      } else {
        await api.departments.create(form);
      }
      toast(`Department "${form.departmentName}" ${editing ? "updated" : "created"} successfully.`);
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
      await api.departments.remove(deleting.departmentId);
      toast(`Department "${deleting.departmentName}" deleted.`);
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
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.departmentName.toLowerCase().includes(q) ||
        item.departmentDescription.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="page max-w-6xl">
      <PageHeader
        eyebrow="Protected Management"
        title="Manage Departments"
        description="Create, update, and manage organizational units. Departments cannot be deleted while linked to active projects."
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Department
          </button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Loading departments..." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 text-xs sm:text-sm"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {items.length} departments
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.departmentId} className="group transition hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-600">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span>{item.departmentName}</span>
                        </div>
                      </td>
                      <td className="max-w-md px-6 py-4 text-slate-600">
                        <p className="line-clamp-2 text-xs sm:text-sm">{item.departmentDescription}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.isActive ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          {item.isActive ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="btn-secondary !p-2"
                            title="Edit department"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleting(item)}
                            className="btn-danger !p-2"
                            title="Delete department"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No departments found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={editing !== undefined}
        title={editing ? "Edit Department" : "Create Department"}
        onClose={() => !busy && setEditing(undefined)}
      >
          <form onSubmit={submit} className="space-y-4">
            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {formError}
              </div>
            )}
            <Field label="Department Name" required>
              <input
                type="text"
                required
                maxLength={100}
                value={form.departmentName}
                onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                placeholder="e.g. Engineering, Sales, Marketing"
                className="input"
              />
            </Field>
            <Field label="Description" required>
              <textarea
                required
                maxLength={300}
                rows={3}
                value={form.departmentDescription}
                onChange={(e) => setForm({ ...form, departmentDescription: e.target.value })}
                placeholder="Briefly describe the responsibilities of this team..."
                className="input"
              />
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-semibold text-slate-700">Active Department</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "Saving..." : editing ? "Save Changes" : "Create Department"}
              </button>
            </div>
          </form>
        </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Department"
        message={`Are you sure you want to permanently delete "${deleting?.departmentName}"? This action cannot be undone.`}
        busy={busy}
        onConfirm={remove}
        onClose={() => !busy && setDeleting(undefined)}
      />
    </div>
  );
}
