import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiCreditCard, FiGlobe, FiSave, FiSettings, FiShield } from "react-icons/fi";
import { toast } from "react-hot-toast";
import adminSettingsService from "../services/adminSettingsService";

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
    supportEmail: "support@example.com",
    supportPhone: "+1 000 000 0000",
    timezone: "UTC",
    currency: "USD"
  },
  payment: {
    taxRate: "8",
    deliveryFee: "2.5",
    minimumOrder: "10",
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

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => {
    const stored = getStoredSettings();
    return stored ? { ...defaultSettings, ...stored } : defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);

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

  const saveSettings = () => {
    return settings;
  };

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await adminSettingsService.getSettings();
        const serverSettings = response?.data || {};
        const merged = {
          general: { ...defaultSettings.general, ...(serverSettings.general || {}) },
          payment: { ...defaultSettings.payment, ...(serverSettings.payment || {}) },
          notifications: { ...defaultSettings.notifications, ...(serverSettings.notifications || {}) }
        };
        setSettings(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        const local = getStoredSettings();
        if (local) {
          setSettings({
            general: { ...defaultSettings.general, ...(local.general || {}) },
            payment: { ...defaultSettings.payment, ...(local.payment || {}) },
            notifications: { ...defaultSettings.notifications, ...(local.notifications || {}) }
          });
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
      [activeTab]: defaultSettings[activeTab]
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
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="BDT">BDT</option>
        </select>
      </label>
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
        <span className="text-sm text-slate-600 dark:text-slate-300">Delivery Fee</span>
        <input
          type="number"
          value={settings.payment.deliveryFee}
          onChange={(e) => updateSection("payment", "deliveryFee", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">Minimum Order</span>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage store, payment, and notification preferences.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSection}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200"
          >
            Reset Section
          </button>
          <button
            onClick={async () => {
              try {
                await adminSettingsService.updateSettings(saveSettings());
                localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
                toast.success("Settings saved");
              } catch {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
                toast.success("Saved locally (server unavailable)");
              }
            }}
            className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm inline-flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 border ${active ? "bg-orange-500 text-white border-orange-500" : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <FiSettings className="w-4 h-4" />
          <span className="font-semibold capitalize">{activeTab} Settings</span>
          <FiShield className="w-4 h-4 text-slate-400" />
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
