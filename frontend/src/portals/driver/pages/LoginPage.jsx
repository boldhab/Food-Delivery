import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiShield, FiTruck, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import { useDriverAuth } from "../context/DriverAuthContext";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import AuthInput from "@/components/auth/AuthInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useDriverAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [underReviewInfo, setUnderReviewInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your courier email and password");
      return;
    }

    setUnderReviewInfo(null);

    try {
      await login(email.trim(), password);
      toast.success("Welcome back! Ready for deliveries.", { icon: "🛵" });
      navigate("/driver/available");
    } catch (error) {
      const respData = error?.response?.data;
      if (respData?.isUnderReview || respData?.message?.toLowerCase().includes("under review")) {
        setUnderReviewInfo({
          email: respData?.driverEmail || email.trim(),
          name: respData?.driverName || ""
        });
        toast("Your courier application is currently under review.", { icon: "⏳" });
      } else {
        toast.error(respData?.message || error.message || "Courier login failed");
      }
    }
  };

  return (
    <AuthSplitLayout
      portalType="driver"
      badge="COURIER FLEET"
      title="Courier Partner Sign In"
      subtitle="Sign in to your driver portal to accept high-priority delivery orders and stream live trip telemetry."
      backTo="/"
      backLabel="Customer Storefront"
      heroTitle="Next-Gen Dynamic Delivery Network"
      heroSubtitle="Streamlined fulfillment with live order heatmaps, turn-by-turn routing, and instant shift payout settlement."
      heroHighlights={[
        "Sub-second order broadcasting and acceptance pipeline",
        "Autonomous shortest-path route recalculation",
        "Transparent real-time gratuities and instant transfer"
      ]}
      heroMetrics={[
        { label: "Fleet Fulfillment", value: "99.4%" },
        { label: "Avg Shift Earnings", value: "2,500+ ETB" },
        { label: "Dispatch Sync", value: "Realtime" }
      ]}
      footer={
        <div className="flex items-center justify-between text-2xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5 font-mono text-[var(--primary)]">
            <FiTruck className="w-3.5 h-3.5" />
            <span>Authorized Food Courier Access Only</span>
          </span>
          <span className="font-mono">COURIER V1.0</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Application Under Review Alert Banner */}
        {underReviewInfo && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-3">
            <div className="flex items-start gap-2.5">
              <FiClock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider">Application Under Review</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  {underReviewInfo.name ? `Hello ${underReviewInfo.name}, your ` : 'Your '}
                  courier application is currently being processed by our compliance and background screening team.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-2xs font-mono text-[var(--muted-foreground)]">
                ⏱️ Review ETA: 12–24 hours
              </span>
              <button
                type="button"
                onClick={() =>
                  navigate("/driver/apply", {
                    state: { email: underReviewInfo.email, tab: "track" }
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-[var(--primary)] hover:opacity-90 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Track Application Status</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Email Input */}
        <AuthInput
          id="driver-email"
          name="email"
          label="Courier Email"
          type="email"
          placeholder="driver@foodiehub.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          icon={FiMail}
          disabled={loading}
        />

        {/* Password Input */}
        <AuthInput
          id="driver-password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          icon={FiLock}
          disabled={loading}
        />

        {/* Shift Security Status */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dispatch Network Active</span>
          </span>
          <span className="font-mono text-2xs text-[var(--muted-foreground)]">
            GPS Live Telematics
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full h-11 px-4 mt-2 rounded-xl
            bg-gradient-to-r from-[var(--primary)] to-orange-500 hover:opacity-95
            text-white text-sm font-semibold tracking-wide
            shadow-md shadow-[var(--primary)]/25 active:scale-[0.99]
            focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 group cursor-pointer
          "
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Starting shift session...</span>
            </>
          ) : (
            <>
              <span>Sign In & Start Shift</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Quick autofill shortcut for testing */}
        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setEmail("driver@foodiehub.com");
              setPassword("Driver@123456");
            }}
            className="text-2xs font-mono text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            Autofill Default Driver Credentials
          </button>
        </div>

        {/* Onboarding callout */}
        <div className="pt-3 text-center text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] mt-4">
          <span>Want to drive with us? </span>
          <Link
            to="/driver/apply"
            className="font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
          >
            Apply to become a Courier Partner
            <FiArrowRight className="w-3.5 h-3.5 inline" />
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
};

export default LoginPage;
