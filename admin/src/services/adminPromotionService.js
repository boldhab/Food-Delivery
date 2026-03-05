import adminApi from "./adminApi";

const normalizePromotion = (promotion) => ({
  _id: promotion?._id || promotion?.id,
  code: String(promotion?.code || "").trim().toUpperCase(),
  title: String(promotion?.title || promotion?.code || "").trim(),
  type: promotion?.type === "fixed" ? "fixed" : "percent",
  value: Number(promotion?.value || 0),
  minOrderAmount: Number(promotion?.minOrderAmount || 0),
  maxUses: promotion?.maxUses === "" || promotion?.maxUses == null ? null : Number(promotion.maxUses),
  usedCount: Number(promotion?.usedCount || 0),
  startDate: promotion?.startDate || "",
  endDate: promotion?.endDate || "",
  isActive: Boolean(promotion?.isActive),
  description: String(promotion?.description || ""),
  bannerImage: String(promotion?.bannerImage || ""),
  ctaLabel: String(promotion?.ctaLabel || ""),
  ctaLink: String(promotion?.ctaLink || ""),
  createdAt: promotion?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

class AdminPromotionService {
  async getPromotions() {
    const response = await adminApi.get("/admin/promotions");
    const rows = response?.data?.data?.promotions || response?.data?.promotions || response?.data?.data || [];
    return { success: true, data: Array.isArray(rows) ? rows.map(normalizePromotion) : [] };
  }

  async createPromotion(payload) {
    const normalized = normalizePromotion(payload);
    const { _id, ...body } = normalized;
    const response = await adminApi.post("/admin/promotions", body);
    const data = response?.data?.data || response?.data;
    return { success: true, data: normalizePromotion(data) };
  }

  async updatePromotion(id, payload) {
    const normalized = normalizePromotion({ ...payload, _id: id });
    const { _id, ...body } = normalized;
    const response = await adminApi.put(`/admin/promotions/${id}`, body);
    const data = response?.data?.data || response?.data;
    return { success: true, data: normalizePromotion(data) };
  }

  async deletePromotion(id) {
    await adminApi.delete(`/admin/promotions/${id}`);
    return { success: true };
  }
}

export default new AdminPromotionService();
