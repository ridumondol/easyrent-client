"use client";

import { useState, type FormEvent } from "react";
import { Boxes, Check, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageIntro,
  StatusBadge,
  TableFrame,
  tableCellClass,
  tableHeadClass,
} from "@/components/dashboard/DashboardUI";
import {
  apiRequest,
  formatAmount,
  getErrorMessage,
  type Equipment,
} from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";

type EquipmentResponse = { equipment: Equipment[]; count: number };
type EquipmentInput = Pick<
  Equipment,
  | "title"
  | "description"
  | "category"
  | "pricePerDay"
  | "location"
  | "image"
  | "quantity"
  | "condition"
  | "availability"
>;

const categories = [
  "construction",
  "photography",
  "electronics",
  "sports",
  "camping",
  "music",
  "tools",
  "vehicles",
  "party",
  "other",
];
const conditions = ["new", "like-new", "good", "fair", "worn"];

function EquipmentEditor({
  item,
  saving,
  error,
  onClose,
  onSave,
}: {
  item: Equipment;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (input: EquipmentInput) => void;
}) {
  const [values, setValues] = useState<EquipmentInput>({
    title: item.title,
    description: item.description,
    category: item.category,
    pricePerDay: item.pricePerDay,
    location: item.location,
    image: item.image,
    quantity: item.quantity,
    condition: item.condition,
    availability: item.availability,
  });

  function update<K extends keyof EquipmentInput>(key: K, value: EquipmentInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(values);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#101b15]/55 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="admin-equipment-editor-title"
        aria-modal="true"
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ec7047]">
              Marketplace listing
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#17271f]" id="admin-equipment-editor-title">
              Update equipment
            </h2>
          </div>
          <button
            aria-label="Close editor"
            className="grid size-9 place-items-center rounded-full bg-[#f3f5f2] text-[#647168]"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </div>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold text-[#34483b]">Title</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              minLength={3}
              onChange={(event) => update("title", event.target.value)}
              required
              value={values.title}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold text-[#34483b]">Description</span>
            <textarea
              className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              minLength={10}
              onChange={(event) => update("description", event.target.value)}
              required
              value={values.description}
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-[#34483b]">Category</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              onChange={(event) => update("category", event.target.value)}
              value={values.category}
            >
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold text-[#34483b]">Condition</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              onChange={(event) => update("condition", event.target.value)}
              value={values.condition}
            >
              {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold text-[#34483b]">Price per day</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              min="0.01"
              onChange={(event) => update("pricePerDay", Number(event.target.value))}
              required
              step="0.01"
              type="number"
              value={values.pricePerDay}
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-[#34483b]">Quantity</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              min="1"
              onChange={(event) => update("quantity", Number(event.target.value))}
              required
              step="1"
              type="number"
              value={values.quantity}
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-[#34483b]">Location</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              minLength={2}
              onChange={(event) => update("location", event.target.value)}
              required
              value={values.location}
            />
          </label>
          <label>
            <span className="text-xs font-semibold text-[#34483b]">Image URL</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-[#dfe5df] px-3.5 py-3 text-sm outline-none focus:border-[#718b78]"
              onChange={(event) => update("image", event.target.value)}
              required
              type="url"
              value={values.image}
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-[#536159] sm:col-span-2">
            <input
              checked={values.availability}
              className="size-4 accent-[#14251e]"
              onChange={(event) => update("availability", event.target.checked)}
              type="checkbox"
            />
            Available to rent
          </label>
          {error && (
            <p className="rounded-xl border border-[#f2d5cb] bg-[#fff7f4] px-4 py-3 text-xs leading-5 text-[#a14630] sm:col-span-2" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <button
              className="rounded-full border border-[#dfe5df] px-4 py-2.5 text-xs font-semibold text-[#536159]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-[#14251e] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function AdminEquipment() {
  const { token } = useAuth();
  const { data, error, loading, reload } = useApiResource<EquipmentResponse>("/admin/equipment", token);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function saveEquipment(input: EquipmentInput) {
    if (!editing) return;
    setSaving(true);
    setFormError("");
    try {
      await apiRequest(`/equipment/${editing._id}`, {
        method: "PATCH",
        token,
        body: input,
      });
      setEditing(null);
      reload();
    } catch (requestError) {
      setFormError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function setApproval(item: Equipment, approvalStatus: "approved" | "rejected") {
    setBusyId(item._id);
    setActionError("");
    try {
      await apiRequest(`/equipment/${item._id}/approval`, {
        method: "PATCH",
        token,
        body: { approvalStatus },
      });
      reload();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteEquipment(item: Equipment) {
    if (!window.confirm(`Permanently delete “${item.title}”?`)) return;
    setBusyId(item._id);
    setActionError("");
    try {
      await apiRequest(`/equipment/${item._id}`, { method: "DELETE", token });
      reload();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  const items = data?.equipment ?? [];

  return (
    <>
      <PageIntro
        description="Review submissions, approve or reject listings, and maintain marketplace inventory."
        eyebrow="Marketplace inventory"
        title="All equipment"
      />
      {actionError && <div className="mb-4"><ErrorState message={actionError} /></div>}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          description="Equipment listings will appear here when owners submit them."
          icon={Boxes}
          title="No equipment found"
        />
      ) : (
        <TableFrame>
          <table className="w-full min-w-[970px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeadClass}>Equipment</th>
                <th className={tableHeadClass}>Owner</th>
                <th className={tableHeadClass}>Daily rate</th>
                <th className={tableHeadClass}>Availability</th>
                <th className={tableHeadClass}>Approval</th>
                <th className={tableHeadClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf3ee] font-semibold text-[#42614b]">
                        {item.title.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate font-semibold text-[#26352c]">{item.title}</span>
                        <span className="mt-1 block text-[10px] capitalize text-[#909a92]">{item.category} · {item.location}</span>
                      </span>
                    </div>
                  </td>
                  <td className={tableCellClass}>
                    <span className="block font-semibold text-[#26352c]">{item.owner?.name ?? "Owner unavailable"}</span>
                    {item.owner?.email && <span className="mt-1 block text-[10px] text-[#909a92]">{item.owner.email}</span>}
                  </td>
                  <td className={`${tableCellClass} font-semibold text-[#26352c]`}>
                    {formatAmount(item.pricePerDay)} / day
                  </td>
                  <td className={tableCellClass}>
                    <StatusBadge status={item.availability ? "available" : "unavailable"} />
                  </td>
                  <td className={tableCellClass}><StatusBadge status={item.approvalStatus} /></td>
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-1.5">
                      {item.approvalStatus !== "approved" && (
                        <button
                          aria-label={`Approve ${item.title}`}
                          className="grid size-8 place-items-center rounded-full border border-[#dce9df] text-[#357148] hover:bg-[#eff7f0] disabled:opacity-50"
                          disabled={busyId === item._id}
                          onClick={() => void setApproval(item, "approved")}
                          title="Approve"
                          type="button"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {item.approvalStatus !== "rejected" && (
                        <button
                          aria-label={`Reject ${item.title}`}
                          className="grid size-8 place-items-center rounded-full border border-[#f1d8d0] text-[#ae523b] hover:bg-[#fff5f1] disabled:opacity-50"
                          disabled={busyId === item._id}
                          onClick={() => void setApproval(item, "rejected")}
                          title="Reject"
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        aria-label={`Edit ${item.title}`}
                        className="grid size-8 place-items-center rounded-full border border-[#e4e9e4] text-[#647168] hover:bg-[#f4f6f3]"
                        onClick={() => {
                          setFormError("");
                          setEditing(item);
                        }}
                        type="button"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        aria-label={`Delete ${item.title}`}
                        className="grid size-8 place-items-center rounded-full border border-[#f1d8d0] text-[#ae523b] hover:bg-[#fff5f1] disabled:opacity-50"
                        disabled={busyId === item._id}
                        onClick={() => void deleteEquipment(item)}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      )}
      {editing && (
        <EquipmentEditor
          error={formError}
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(input) => void saveEquipment(input)}
          saving={saving}
        />
      )}
    </>
  );
}
