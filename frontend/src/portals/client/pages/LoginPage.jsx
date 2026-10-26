import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiShield, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthInput from '@/components/auth/AuthInput';
import SocialAuthButtons from './register/components/SocialAuthButtons';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);
    const [formErrors, setFormErrors] = useState({});

    const fromState = location.state?.from;
    const redirectTo = typeof fromState === 'string' ? fromState : fromState?.pathname || '/';

    const validate = () => {
        const errors = {};
        if (!form.email.trim()) {
            errors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!form.password) {
            errors.password = 'Password is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting || retryAfter > 0) return;
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await login(form);
            const userData = res?.data?.user || res?.data || res?.user;
            const role = userData?.role;

            toast.success('Welcome back to Food Hub!');

            if (role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (role === 'driver') {
                navigate('/driver/available', { replace: true });
            } else {
                navigate(redirectTo, { replace: true });
            }
        } catch (error) {
            if (error?.response?.status === 429) {
                const retryHeader = Number(error?.response?.headers?.['retry-after']);
                const waitSeconds = Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : 30;
                setRetryAfter(waitSeconds);
                toast.error(`Too many attempts. Try again in ${waitSeconds}s.`);
            } else {
                const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
                toast.error(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (retryAfter <= 0) return;
        const timer = setInterval(() => {
            setRetryAfter((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [retryAfter]);

    const handleQuickFill = (email, password) => {
        setForm({ email, password });
        setFormErrors({});
    };

    return (
        <AuthSplitLayout
            portalType="client"
            badge="PORTAL ACCESS"
            title="Sign in to your account"
            subtitle="Access your orders, favorites, and real-time culinary delivery updates."
            backTo="/"
            backLabel="Back to Storefront"
            heroTitle="Your Favorite Food, Delivered Fast"
            heroSubtitle="Discover the finest local restaurants and cloud kitchens with live GPS courier tracking right to your doorstep."
            heroHighlights={[
                'Fresh meals from 500+ top-rated local restaurants',
                'Live real-time GPS tracking on every single order',
                'Fast, reliable, and secure contactless delivery'
            ]}
            heroMetrics={[
                { label: 'Happy Foodies', value: '50k+' },
                { label: 'Avg Delivery', value: '24 min' },
                { label: 'App Rating', value: '4.9 ★' }
            ]}
        >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Rate limit warning alert */}
                {retryAfter > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5">
                        <FiAlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>Security cooldown active. You can retry in <strong>{retryAfter}s</strong>.</span>
                    </div>
                )}

                {/* Email Field */}
                <AuthInput
                    id="client-login-email"
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    required
                    autoComplete="email"
                    icon={FiMail}
                    error={formErrors.email}
                    disabled={submitting || retryAfter > 0}
                />

                {/* Password Field */}
                <div className="space-y-1">
                    <AuthInput
                        id="client-login-password"
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••••••"
                        value={form.password}
                        onChange={(e) => {
                            setForm({ ...form, password: e.target.value });
                            if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                        }}
                        required
                        autoComplete="current-password"
                        icon={FiLock}
                        error={formErrors.password}
                        disabled={submitting || retryAfter > 0}
                    />

                    {/* Forgot password link */}
                    <div className="flex justify-end pt-1">
                        <Link
                            to="/forgot-password"
                            className="text-[11px] font-semibold text-[var(--primary)] hover:underline underline-offset-4 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {/* Primary Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || retryAfter > 0}
                    className="
                        w-full h-11 px-4 mt-2 rounded-xl
                        bg-[var(--primary)] hover:brightness-110 active:scale-[0.99]
                        text-white text-sm font-bold tracking-wide
                        shadow-md shadow-[var(--primary)]/20
                        focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25
                        transition-all duration-200 motion-reduce:transition-none
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2 group cursor-pointer
                    "
                >
                    {submitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Authenticating credentials...</span>
                        </>
                    ) : retryAfter > 0 ? (
                        <span>Retry in {retryAfter}s</span>
                    ) : (
                        <>
                            <span>Sign In to Account</span>
                            <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                    )}
                </button>

                {/* Registration link */}
                <div className="text-center pt-2">
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                        Don&apos;t have an account yet?{' '}
                        <Link
                            to="/register"
                            state={{ from: redirectTo }}
                            className="font-bold text-[var(--primary)] hover:underline underline-offset-4 transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>

                {/* Social Login (Google One-Tap / OAuth) */}
                <SocialAuthButtons redirectTo={redirectTo} />

                {/* Architectural Quick Demo Sign-In Presets */}
                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                          Quick Demo Credentials
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FiShield className="w-3 h-3" />
                          <span>Pre-seeded</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => handleQuickFill('user@foodiehub.com', 'User@123456')}
                            className="p-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--card)] hover:border-emerald-500/60 transition-all duration-200 flex flex-col items-center gap-0.5 cursor-pointer text-left group"
                        >
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                              🛒 Customer
                            </span>
                            <span className="text-[10px] font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                              Storefront
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFill('admin@foodiehub.com', 'Admin@123456')}
                            className="p-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--card)] hover:border-amber-500/60 transition-all duration-200 flex flex-col items-center gap-0.5 cursor-pointer text-left group"
                        >
                            <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                              👑 Admin
                            </span>
                            <span className="text-[10px] font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                              Dashboard
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFill('driver@foodiehub.com', 'Driver@123456')}
                            className="p-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--card)] hover:border-teal-500/60 transition-all duration-200 flex flex-col items-center gap-0.5 cursor-pointer text-left group"
                        >
                            <span className="font-bold text-teal-600 dark:text-teal-400 text-xs">
                              🛵 Driver
                            </span>
                            <span className="text-[10px] font-mono text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                              Courier
                            </span>
                        </button>
                    </div>
                </div>
            </form>
        </AuthSplitLayout>
    );
};

export default LoginPage;
