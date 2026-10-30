import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiShield, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAdminAuth } from "../hooks/useAdminAuth";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import AuthInput from "@/components/auth/AuthInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        toast.success("Welcome back, Administrator!", { icon: "👋" });
        navigate("/admin", { replace: true });
      } else {
        const errorMsg = result.message || "Invalid credentials. Please verify and retry.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.message || "An unexpected error occurred during login.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      portalType="admin"
      badge="COMMAND ACCESS"
      title="Admin Operations"
      subtitle="Authorized personnel only. Authenticate to manage dispatch, menus, and users."
      backTo="/"
      backLabel="Customer Storefront"
      heroTitle="Mission-Critical Platform Infrastructure"
      heroSubtitle="Unified control plane for culinary catalogs, dynamic delivery zones, and real-time revenue analytics."
      heroHighlights={[
        "Autonomous algorithmic courier dispatch & clustering",
        "Granular role-based operational permissions (RBAC)",
        "Live financial reconciliation & Stripe payout settlement"
      ]}
      heroMetrics={[
        { label: "Active Nodes", value: "1,420+" },
        { label: "Avg Response", value: "12ms" },
        { label: "Security Level", value: "L4 Admin" }
      ]}
      footer={
        <div className="flex items-center justify-between text-2xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5 font-mono text-[var(--primary)]">
            <FiShield className="w-3.5 h-3.5" />
            <span>Authorized Personnel Only</span>
          </span>
          <span className="font-mono">BUILD 2026.10-ADM</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error Alert Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-left text-xs text-red-600 dark:text-red-400 font-medium">
            <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Input */}
        <AuthInput
          id="admin-email"
          name="email"
          label="Admin Email"
          type="email"
          placeholder="admin@foodiehub.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          required
          autoComplete="email"
          icon={FiMail}
          disabled={submitting}
        />

        {/* Password Input */}
        <AuthInput
          id="admin-password"
          name="password"
          label="Security Key / Password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
          required
          autoComplete="current-password"
          icon={FiLock}
          disabled={submitting}
        />

        {/* Preferences Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
            />
            <span>Remember session</span>
          </label>
          <span className="font-mono text-2xs text-[var(--muted-foreground)]">
            TLS 1.3 Strict
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="
            w-full h-11 px-4 mt-2 rounded-xl
            bg-gradient-to-r from-[var(--primary)] to-orange-500 hover:opacity-95
            text-white text-sm font-bold tracking-wide
            shadow-md shadow-[var(--primary)]/25 active:scale-[0.99]
            focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 group cursor-pointer
          "
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Command Center</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Quick autofill shortcut for testing */}
        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@foodiehub.com");
              setPassword("Admin@123456");
              setError("");
            }}
            className="text-2xs font-mono text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            Autofill Default Admin Credentials
          </button>
        </div>
      </form>
    </AuthSplitLayout>
  );
};

export default LoginPage;
