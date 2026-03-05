import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import adminPromotionService from "../services/adminPromotionService";

const EMPTY_FORM = {
  code: "",
  title: "",
  type: "percent",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  startDate: "",
  endDate: "",
  description: "",
  bannerImage: "",
  ctaLabel: "",
  ctaLink: "",
  isActive: true
};

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminPromotionService.getPromotions();
      setPromotions(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      toast.error(error?.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const sortedPromotions = useMemo(
    () =>
      [...promotions].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
      ),
    [promotions]
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setForm({
      code: row.code || "",
      title: row.title || "",
      type: row.type || "percent",
      value: row.value ?? "",
      minOrderAmount: row.minOrderAmount ?? "",
      maxUses: row.maxUses ?? "",
      startDate: row.startDate ? String(row.startDate).slice(0, 10) : "",
      endDate: row.endDate ? String(row.endDate).slice(0, 10) : "",
      description: row.description || "",
      bannerImage: row.bannerImage || "",
      ctaLabel: row.ctaLabel || "",
      ctaLink: row.ctaLink || "",
      isActive: Boolean(row.isActive)
    });
  };

  const validateForm = () => {
    const code = String(form.code || "").trim().toUpperCase();
    const title = String(form.title || "").trim();
    if (!code) return "Promo code is required";
    if (!title) return "Title is required";
    if (code.length < 3) return "Promo code must be at least 3 characters";

    const value = Number(form.value);
    if (!Number.isFinite(value) || value <= 0) return "Discount value must be greater than 0";
    if (form.type === "percent" && value > 100) return "Percent discount cannot be above 100";

    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      return "End date must be after start date";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      code: String(form.code).trim().toUpperCase(),
      title: String(form.title || "").trim(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount === "" ? 0 : Number(form.minOrderAmount),
      maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      startDate: form.startDate || "",
      endDate: form.endDate || "",
      description: form.description,
      bannerImage: form.bannerImage,
      ctaLabel: form.ctaLabel,
      ctaLink: form.ctaLink,
      isActive: Boolean(form.isActive)
    };

    setSaving(true);
    try {
      if (editingId) {
        const response = await adminPromotionService.updatePromotion(editingId, payload);
        setPromotions((prev) => prev.map((item) => (item._id === editingId ? response.data : item)));
        toast.success("Promotion updated");
      } else {
        const response = await adminPromotionService.createPromotion(payload);
        setPromotions((prev) => [response.data, ...prev]);
        toast.success("Promotion created");
      }
      resetForm();
    } catch (error) {
      toast.error(error?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promotion?")) return;
    try {
      await adminPromotionService.deletePromotion(id);
      setPromotions((prev) => prev.filter((item) => item._id !== id));
      toast.success("Promotion deleted");
      if (editingId === id) resetForm();
    } catch (error) {
      toast.error(error?.message || "Failed to delete promotion");
    }
  };

  const formatDiscount = (row) => (row.type === "fixed" ? `$${Number(row.value || 0).toFixed(2)}` : `${Number(row.value || 0)}%`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Promotions</h1>
        <p className="text-sm text-slate-500 mt-1">Create and manage promo codes for customer discounts.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            {editingId ? <FiEdit2 className="w-5 h-5 text-orange-500" /> : <FiPlus className="w-5 h-5 text-orange-500" />}
            {editingId ? "Edit Promotion" : "New Promotion"}
          </h2>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="Code (e.g. SAVE10)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ad title (e.g. Weekend Mega Deal)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                placeholder="Min order"
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                type="number"
                min="1"
                step="1"
                value={form.maxUses}
                onChange={(e) => setForm((prev) => ({ ...prev, maxUses: e.target.value }))}
                placeholder="Max uses"
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <div className="grid grid-cols-1 gap-3">
              <input
                value={form.bannerImage}
                onChange={(e) => setForm((prev) => ({ ...prev, bannerImage: e.target.value }))}
                placeholder="Banner image URL (optional)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.ctaLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                  placeholder="CTA label (optional)"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
                <input
                  value={form.ctaLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))}
                  placeholder="CTA link (optional)"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Promotion List</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading promotions...</div>
          ) : sortedPromotions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No promotions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Discount</th>
                    <th className="py-2 pr-3">Min Order</th>
                    <th className="py-2 pr-3">Period</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPromotions.map((row) => (
                    <tr key={row._id} className="border-b border-slate-100 dark:border-slate-700/60">
                      <td className="py-3 pr-3 font-mono font-semibold text-slate-900 dark:text-white">{row.code}</td>
                      <td className="py-3 pr-3">{row.title || "-"}</td>
                      <td className="py-3 pr-3">{formatDiscount(row)}</td>
                      <td className="py-3 pr-3">${Number(row.minOrderAmount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">
                        {(row.startDate || "").slice(0, 10) || "-"} to {(row.endDate || "").slice(0, 10) || "-"}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${row.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"}`}
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(row)}
                            className="p-1.5 rounded border border-slate-300 dark:border-slate-600 hover:border-orange-400"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
                            className="p-1.5 rounded border border-slate-300 dark:border-slate-600 hover:border-red-400 text-red-500"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
};

export default PromotionsPage;
