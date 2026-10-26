import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
  FiCopy,
  FiCheck,
  FiTag,
  FiCalendar,
  FiShoppingBag,
  FiSearch
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import adminPromotionService from "../services/adminPromotionService";
import { formatCurrency } from "../utils/adminHelpers";

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
  const [copiedCode, setCopiedCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'active' | 'inactive'

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

  const sortedPromotions = useMemo(() => {
    return [...promotions].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return sortedPromotions.filter((promo) => {
      const matchesSearch =
        promo.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "active") return Boolean(promo.isActive);
      if (filterStatus === "inactive") return !promo.isActive;
      return true;
    });
  }, [sortedPromotions, searchQuery, filterStatus]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        setPromotions((prev) =>
          prev.map((item) => (item._id === editingId ? response.data : item))
        );
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

  const handleToggleActive = async (row) => {
    const updatedState = !row.isActive;
    try {
      await adminPromotionService.updatePromotion(row._id, {
        ...row,
        isActive: updatedState
      });
      setPromotions((prev) =>
        prev.map((item) => (item._id === row._id ? { ...item, isActive: updatedState } : item))
      );
      toast.success(updatedState ? `Promo ${row.code} activated` : `Promo ${row.code} deactivated`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const formatDiscount = (row) =>
    row.type === "fixed"
      ? `${Number(row.value || 0).toFixed(2)} ETB OFF`
      : `${Number(row.value || 0)}% OFF`;

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Promotions & Deals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create, distribute, and manage discount vouchers and coupon campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Form Card */}
        <div className="xl:col-span-1 bg-card rounded-2xl border border-border p-5 shadow-xs h-fit sticky top-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            {editingId ? (
              <FiEdit2 className="w-4 h-4 text-primary" />
            ) : (
              <FiPlus className="w-4 h-4 text-primary" />
            )}
            {editingId ? "Edit Deal / Voucher" : "New Promotion Deal"}
          </h2>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Coupon Code *
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER50"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold uppercase text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Deal Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. 50% Off First 3 Orders"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Discount Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Cash (ETB)</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder={form.type === "percent" ? "20" : "50.00"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Min Order (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Max Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxUses: e.target.value }))}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short customer terms or promotional tagline..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium text-xs">Enable promotion immediately</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs transition-colors text-sm"
              >
                <FiSave className="w-4 h-4" />
                {saving ? "Saving..." : editingId ? "Update Deal" : "Create Deal"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-sm transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Voucher Cards */}
        <div className="xl:col-span-2 space-y-4">
          {/* Deals Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals by code or title..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilterStatus(tab.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterStatus === tab.value
                      ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="text-slate-300 dark:text-slate-700 ml-1">|</span>
              <span className="text-xs text-slate-500 ml-1 tabular-nums">
                {filteredPromotions.length} deals
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-24 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                  <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-3">
                <FiTag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No promotions found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Create a promo code using the form on the left to launch your discount campaign.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPromotions.map((promo) => {
                const expired = isExpired(promo.endDate);
                const discountText = formatDiscount(promo);

                return (
                  <div
                    key={promo._id}
                    className={`relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between p-5 bg-white dark:bg-slate-800 ${
                      promo.isActive && !expired
                        ? "border-slate-200 dark:border-slate-700/80 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md"
                        : "border-slate-200/60 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-850"
                    }`}
                  >
                    {/* Top Voucher Header: Discount Pill & Promo Code */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        {/* Discount Banner */}
                        <span className="text-base font-black px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          {discountText}
                        </span>

                        {/* Status Pill */}
                        <div className="flex items-center gap-1.5">
                          {expired ? (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                              Expired
                            </span>
                          ) : promo.isActive ? (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                              Active
                            </span>
                          ) : (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                              Paused
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Promo Code Badge with 1-Click Copy */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 mb-3 group/code">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-widest pl-1">
                          {promo.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(promo.code)}
                          className="px-2 py-1 rounded-lg text-2xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:border-primary-400 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy promo code"
                        >
                          {copiedCode === promo.code ? (
                            <>
                              <FiCheck className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">
                        {promo.title}
                      </h3>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {promo.description || "No additional terms specified."}
                      </p>

                      {/* Campaign Conditions */}
                      <div className="space-y-1.5 text-2xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <FiShoppingBag className="w-3 h-3" /> Min Order:
                          </span>
                          <span className="font-semibold tabular-nums">
                            {promo.minOrderAmount > 0
                              ? formatCurrency(promo.minOrderAmount)
                              : "No Minimum"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <FiTag className="w-3 h-3" /> Usage Limit:
                          </span>
                          <span className="font-semibold tabular-nums">
                            {promo.maxUses ? `${promo.maxUses} uses` : "Unlimited"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" /> Period:
                          </span>
                          <span className="tabular-nums text-slate-500">
                            {(promo.startDate || "").slice(0, 10) || "Now"} →{" "}
                            {(promo.endDate || "").slice(0, 10) || "Ongoing"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(promo)}
                        className={`text-2xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          promo.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {promo.isActive ? "Pause Deal" : "Activate"}
                      </button>

                      {/* Edit & Delete Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(promo)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
                          title="Edit deal"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(promo._id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-400 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete deal"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;
