"use client";

import { Calendar, Mail, Pencil, Search, Shield, ShieldAlert, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getUser, isAuthenticated, isAdmin } from "@/lib/auth";
import type { SystemAccount, UpdateAccountInput } from "@/types";
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

export default function AdminAccountsPage() {
  const router = useRouter();
  const toast = useToast();
  const currentUser = getUser();

  const [items, setItems] = useState<SystemAccount[]>();
  const [error, setError] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editing, setEditing] = useState<SystemAccount | null>();
  const [form, setForm] = useState<UpdateAccountInput>({ fullName: "", role: 0 });
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<SystemAccount>();

  const load = () => {
    setError("");
    setIsForbidden(false);
    api.accounts
      .list()
      .then(setItems)
      .catch((e: Error) => {
        if (e.message.includes("403") || e.message.toLowerCase().includes("forbidden")) {
          setIsForbidden(true);
        } else {
          setError(e.message);
        }
      });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!isAdmin()) {
      setIsForbidden(true);
      return;
    }
    load();
  }, [router]);

  const openEdit = (item: SystemAccount) => {
    setEditing(item);
    setForm({
      fullName: item.fullName,
      role: item.role,
    });
    setFormError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!form.fullName?.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    setBusy(true);
    setFormError("");
    try {
      await api.accounts.update(editing.accountId, form);
      toast(`Account "${form.fullName}" updated successfully.`);
      setEditing(null);
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to update account.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.accounts.remove(deleting.accountId);
      toast(`Account "${deleting.fullName}" deleted successfully.`);
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
      (acc) =>
        acc.fullName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.roleName.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  if (isForbidden) {
    return (
      <div className="page max-w-4xl">
        <PageHeader
          eyebrow="Access Denied"
          title="Admin Accounts"
          description="System Account Management is restricted to Admin role only."
        />
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center text-rose-800 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">HTTP 403 Forbidden</h2>
          <p className="mt-2 text-sm text-rose-600 max-w-md mx-auto">
            Your current account ({currentUser?.email || "Staff"}) does not have Administrator privileges to manage system accounts.
          </p>
          <div className="mt-6">
            <button className="btn-secondary" onClick={() => router.push("/admin")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page max-w-5xl">
      <PageHeader
        eyebrow="Admin Only Area"
        title="Manage Accounts"
        description="View all registered users, update roles (Staff vs Admin), and manage permissions. Accounts with active task contributions cannot be deleted."
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Loading user accounts..." />
      ) : (
        <div className="space-y-4">
          {/* Quick Search Bar */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 text-xs sm:text-sm"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {items.length} accounts
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              title={items.length === 0 ? "No accounts found" : "No accounts match this search"}
              detail={
                items.length === 0
                  ? "Accounts are registered through the public Register page."
                  : `No account matching "${searchQuery}".`
              }
              action={
                items.length > 0 ? (
                  <button className="btn-secondary" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Info</th>
                    <th>Email Address</th>
                    <th>System Role</th>
                    <th>Created Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const isSelf = currentUser?.accountId === item.accountId;
                    const isStaff = item.role === 0;

                    return (
                      <tr key={item.accountId}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 font-bold text-brand-700">
                              {item.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                {item.fullName}
                                {isSelf && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">
                                ID: #{item.accountId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.email}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                              item.role === 1
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <Shield className="h-3 w-3" />
                            {item.roleName || (item.role === 1 ? "Admin" : "Staff")}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{new Date(item.createdDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition"
                              onClick={() => openEdit(item)}
                              title="Edit account name and role"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className={`rounded-lg p-2 transition ${
                                isSelf
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              }`}
                              disabled={isSelf}
                              onClick={() => !isSelf && setDeleting(item)}
                              title={isSelf ? "Cannot delete your own account" : "Delete account"}
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={editing !== null && editing !== undefined}
        title="Update Account"
        onClose={() => setEditing(null)}
      >
        <form onSubmit={submit} className="space-y-5">
          <Field label="Email Address">
            <input
              className="input bg-slate-50 text-slate-500 cursor-not-allowed"
              value={editing?.email || ""}
              disabled
            />
            <p className="mt-1 text-xs text-slate-400">Account email cannot be modified.</p>
          </Field>

          <Field label="Full Name" required>
            <input
              className="input"
              maxLength={150}
              placeholder="e.g. John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>

          <Field label="Role Assignment" required>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  form.role === 0
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={0}
                  checked={form.role === 0}
                  onChange={() => setForm({ ...form, role: 0 })}
                  className="accent-emerald-600"
                />
                <div>
                  <div className="text-sm font-bold">Staff (0)</div>
                  <div className="text-xs text-slate-500">Standard operational access</div>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                  form.role === 1
                    ? "border-purple-600 bg-purple-50/50 text-purple-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={1}
                  checked={form.role === 1}
                  onChange={() => setForm({ ...form, role: 1 })}
                  className="accent-purple-600"
                />
                <div>
                  <div className="text-sm font-bold">Admin (1)</div>
                  <div className="text-xs text-slate-500">Full management rights</div>
                </div>
              </label>
            </div>
          </Field>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Account?"
        message={`Are you sure you want to delete "${deleting?.fullName}" (${deleting?.email})? This action will be rejected by the backend if this user has created any tasks.`}
        busy={busy}
        onClose={() => setDeleting(undefined)}
        onConfirm={remove}
      />
    </div>
  );
}
