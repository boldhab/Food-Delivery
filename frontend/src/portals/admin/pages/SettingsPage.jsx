import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCreditCard, FiGlobe, FiSave, FiSettings, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";
import adminSettingsService from "../services/adminSettingsService";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const STORAGE_KEY = "adminSettings";

const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const defaultSettings = {
  general: {
    businessName: "Food Delivery",
    supportEmail: "support@foodhub.et",
    supportPhone: "+251 91 123 4567",
    timezone: "Africa/Addis_Ababa",
    currency: "ETB"
  },
  payment: {
    taxRate: "15",
    deliveryFee: "80",
    minimumOrder: "200",
    allowCashOnDelivery: true,
    autoCapturePayments: false
  },
  notifications: {
    emailOnNewOrder: true,
    emailOnCancelledOrder: true,
    smsOnNewOrder: false,
    pushOnDriverAssigned: true,
    dailySummary: true
  }
};

const mergeSettings = (incoming = {}) => ({
  general: { ...defaultSettings.general, ...(incoming.general || {}) },
  payment: { ...defaultSettings.payment, ...(incoming.payment || {}) },
  notifications: { ...defaultSettings.notifications, ...(incoming.notifications || {}) }
});

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => {
    const stored = getStoredSettings();
    return mergeSettings(stored || {});
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const activeTab = useMemo(() => {
    if (location.pathname.endsWith("/payment")) return "payment";
    if (location.pathname.endsWith("/notifications")) return "notifications";
    return "general";
  }, [location.pathname]);

  const tabs = [
    { key: "general", label: "General", path: "/admin/settings/general", icon: FiGlobe },
    { key: "payment", label: "Payment", path: "/admin/settings/payment", icon: FiCreditCard },
    { key: "notifications", label: "Notifications", path: "/admin/settings/notifications", icon: FiBell }
  ];

  const updateSection = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await adminSettingsService.getSettings();
        const serverSettings = response?.data || response?.settings || {};
        const merged = mergeSettings(serverSettings);
        setSettings(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load settings from server");
        const local = getStoredSettings();
        if (local) {
          setSettings(mergeSettings(local));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const resetSection = () => {
    setSettings((prev) => ({
      ...prev,
      [activeTab]: { ...defaultSettings[activeTab] }
    }));
    toast.success("Section reset");
  };

  const renderGeneral = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Business Name</span>
        <input
          value={settings.general.businessName}
          onChange={(e) => updateSection("general", "businessName", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Support Email</span>
        <input
          type="email"
          value={settings.general.supportEmail}
          onChange={(e) => updateSection("general", "supportEmail", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Support Phone</span>
        <input
          value={settings.general.supportPhone}
          onChange={(e) => updateSection("general", "supportPhone", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Timezone</span>
        <select
          value={settings.general.timezone}
          onChange={(e) => updateSection("general", "timezone", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (East Africa Time)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Dhaka">Asia/Dhaka</option>
        </select>
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-slate-600 dark:text-slate-300">Currency</span>
        <select
          value={settings.general.currency}
          onChange={(e) => updateSection("general", "currency", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="USD">USD ($)</option>
          <option value="ETB">ETB (Br)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="BDT">BDT (৳)</option>
        </select>
      </label>

      {/* Theme & Appearance Section */}
      <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Admin Dashboard Appearance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your dashboard visual theme: Light, Dark, or System mode
            </p>
          </div>
          <ThemeSwitcher variant="segmented" size="md" />
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Tax Rate (%)</span>
        <input
          type="number"
          value={settings.payment.taxRate}
          onChange={(e) => updateSection("payment", "taxRate", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Delivery Fee (ETB)</span>
        <input
          type="number"
          value={settings.payment.deliveryFee}
          onChange={(e) => updateSection("payment", "deliveryFee", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Minimum Order (ETB)</span>
        <input
          type="number"
          value={settings.payment.minimumOrder}
          onChange={(e) => updateSection("payment", "minimumOrder", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <div className="space-y-3 md:col-span-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={settings.payment.allowCashOnDelivery}
            onChange={(e) => updateSection("payment", "allowCashOnDelivery", e.target.checked)}
          />
          Allow cash on delivery
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={settings.payment.autoCapturePayments}
            onChange={(e) => updateSection("payment", "autoCapturePayments", e.target.checked)}
          />
          Auto capture online payments
        </label>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-3">
      {[
        ["emailOnNewOrder", "Email on new order"],
        ["emailOnCancelledOrder", "Email on cancelled order"],
        ["smsOnNewOrder", "SMS on new order"],
        ["pushOnDriverAssigned", "Push on driver assignment"],
        ["dailySummary", "Daily summary report"]
      ].map(([field, label]) => (
        <label key={field} className="flex items-center justify-between px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg">
          <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
          <input
            type="checkbox"
            checked={Boolean(settings.notifications[field])}
            onChange={(e) => updateSection("notifications", field, e.target.checked)}
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage store, payment, and notification preferences.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetSection}
            className="h-9 px-3.5 rounded-xl border border-border bg-card text-foreground hover:border-primary/50 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Reset Section
          </button>
          <button
            onClick={async () => {
              setIsSaving(true);
              try {
                const response = await adminSettingsService.updateSettings(settings);
                const saved = mergeSettings(response?.data || {});
                setSettings(saved);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
                toast.success("Settings saved");
              } catch (error) {
                toast.error(error?.response?.data?.message || "Failed to save settings");
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || isLoading}
            className="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FiSave className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`h-8 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                  active 
                    ? "bg-primary text-white shadow-xs font-bold" 
                    : "border border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-foreground">
          <FiSettings className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm capitalize">{activeTab} Settings</span>
          <FiShield className="w-4 h-4 text-muted-foreground" />
        </div>
        {isLoading ? (
          <div className="py-6 text-sm text-slate-500">Loading settings...</div>
        ) : (
          <>
            {activeTab === "general" && renderGeneral()}
            {activeTab === "payment" && renderPayment()}
            {activeTab === "notifications" && renderNotifications()}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
