"use client";

import { Pencil, Plus, Search, Tag as TagIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import type { Tag, TagInput } from "@/types";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Modal,
  PageHeader,
  TagBadge,
} from "@/components/ui";
import { useToast } from "@/components/ToastProvider";

const presetColors = [
  "#2563EB", // Blue
  "#0284C7", // Sky
  "#059669", // Emerald
  "#D97706", // Amber
  "#DC2626", // Red
  "#7C3AED", // Violet
  "#DB2777", // Pink
  "#475569", // Slate
];

const blank: TagInput = { tagName: "", color: "#2563EB" };

export default function AdminTagsPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Tag[]>();
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editing, setEditing] = useState<Tag | null | undefined>();
  const [form, setForm] = useState<TagInput>(blank);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<Tag>();

  const load = () => {
    setError("");
    api.tags
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

  const openEdit = (item: Tag) => {
    setEditing(item);
    setForm({ tagName: item.tagName, color: item.color || "#475569" });
    setFormError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.tagName.trim()) {
      setFormError("Tag name is required.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      if (editing) {
        await api.tags.update(editing.tagId, form);
      } else {
        await api.tags.create(form);
      }
      toast(`Tag "${form.tagName}" ${editing ? "updated" : "created"} successfully.`);
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
      await api.tags.remove(deleting.tagId);
      toast(`Tag "${deleting.tagName}" deleted.`);
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
    return items.filter((tag) => tag.tagName.toLowerCase().includes(q));
  }, [items, searchQuery]);

  return (
    <div className="page max-w-4xl">
      <PageHeader
        eyebrow="Protected Management"
        title="Manage Tags"
        description="Create, edit, and organize task tags. Authenticated write operations enabled."
        action={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Tag
          </button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <LoadingState label="Loading tags..." />
      ) : (
        <div className="space-y-4">
          {/* Quick Search Bar */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 text-xs sm:text-sm"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{filteredItems.length}</strong> of {items.length} tags
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              title={items.length === 0 ? "No tags created" : "No tags match this search"}
              detail={
                items.length === 0
                  ? "Create tags like 'Frontend', 'Backend', 'Bug', 'Urgent' to categorize work."
                  : `No tag named "${searchQuery}".`
              }
              action={
                items.length === 0 ? (
                  <button className="btn-primary" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Add Tag
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </button>
                )
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tag Badge</th>
                    <th>Color Code</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.tagId}>
                      <td>
                        <TagBadge tag={item} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: item.color || "#475569" }}
                          />
                          <span className="font-mono text-xs text-slate-600 uppercase">
                            {item.color || "None"}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition"
                            onClick={() => openEdit(item)}
                            title="Edit tag"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            onClick={() => setDeleting(item)}
                            title="Delete tag"
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
        title={editing ? "Edit Tag" : "Create New Tag"}
        onClose={() => setEditing(undefined)}
      >
        <form onSubmit={submit} className="space-y-5">
          <Field label="Tag Name" required>
            <input
              className="input"
              maxLength={50}
              placeholder="e.g. Bug, Feature, Documentation, Review"
              value={form.tagName}
              onChange={(e) => setForm({ ...form, tagName: e.target.value })}
            />
          </Field>

          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Color Palette
            </span>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`h-8 w-8 rounded-xl border-2 transition-all ${
                    form.color?.toUpperCase() === color.toUpperCase()
                      ? "border-slate-900 scale-110 shadow-sm"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded-xl border border-slate-300 bg-white p-1"
                value={form.color || "#2563EB"}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
              <input
                className="input uppercase font-mono text-xs"
                placeholder="#HEXCODE"
                maxLength={7}
                value={form.color || ""}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Badge Preview</p>
            <TagBadge tag={{ tagId: 0, tagName: form.tagName.trim() || "Preview Tag", color: form.color }} />
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setEditing(undefined)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : editing ? "Save Changes" : "Create Tag"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Tag?"
        message={`Delete "${deleting?.tagName}"? Tags currently used by tasks cannot be deleted.`}
        busy={busy}
        onClose={() => setDeleting(undefined)}
        onConfirm={remove}
      />
    </div>
  );
}
