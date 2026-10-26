import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowRight, FiCheckCircle, FiShield, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthInput from '@/components/auth/AuthInput';
import authService from '../services/auth.service';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [successData, setSuccessData] = useState(null);

    const validate = () => {
        if (!email.trim()) {
            setEmailError('Please enter your email address');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting || !validate()) return;

        setSubmitting(true);
        try {
            const res = await authService.forgotPassword(email.trim());
            setSuccessData(res);
            toast.success(res?.message || 'Password reset link generated');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to dispatch reset link. Please try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthSplitLayout
            portalType="client"
            badge="ACCOUNT RECOVERY"
            title="Recover your password"
            subtitle="Enter your registered email address and we'll send you secure password reset instructions."
            backTo="/login"
            backLabel="Back to Login"
            heroTitle="Quick & Secure Account Recovery"
            heroSubtitle="We'll help you reset your password safely so you can get back to exploring top dishes and ordering your favorite meals."
            heroHighlights={[
                'Secure 30-minute one-time recovery reset link',
                'Instant password change confirmation & account security',
                'Dedicated 24/7 customer support whenever you need help'
            ]}
            heroMetrics={[
                { label: 'Token Lifespan', value: '30 min' },
                { label: 'Security', value: 'Encrypted' },
                { label: 'Support', value: '24/7 Live' }
            ]}
        >
            {successData ? (
                <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--foreground)] space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            <FiCheckCircle className="w-5 h-5" />
                            <span>Reset Instructions Dispatched</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                            If an account exists for <strong>{email}</strong>, you will receive password reset instructions. The reset link is valid for 30 minutes.
                        </p>
                    </div>

                    {/* Developer / Testing Quick Action Link (when resetToken is provided) */}
                    {successData.resetToken && (
                        <div className="p-3.5 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 space-y-2">
                            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1">
                                <FiShield className="w-3.5 h-3.5" />
                                <span>Testing & Developer Quick-Action</span>
                            </span>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                A reset token was generated for your session:
                            </p>
                            <Link
                                to={`/reset-password?token=${successData.resetToken}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline underline-offset-4"
                            >
                                <span>Proceed directly to Reset Password page</span>
                                <FiExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                            type="button"
                            onClick={() => {
                                setSuccessData(null);
                                setEmail('');
                            }}
                            className="flex-1 h-11 border border-[var(--border)] rounded-xl font-semibold text-xs uppercase tracking-wider text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)]/50 transition-colors cursor-pointer"
                        >
                            Try Another Email
                        </button>
                        <Link
                            to="/login"
                            className="flex-1 h-11 rounded-xl bg-[var(--primary)] hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-[var(--primary)]/20"
                        >
                            <span>Back to Sign In</span>
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <AuthInput
                        id="forgot-email"
                        name="email"
                        label="Registered Email Address"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                        }}
                        required
                        autoComplete="email"
                        icon={FiMail}
                        error={emailError}
                        disabled={submitting}
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="
                            w-full h-11 px-4 mt-2 rounded-xl
                            bg-[var(--primary)] hover:brightness-110 active:scale-[0.99]
                            text-white text-sm font-bold tracking-wide
                            shadow-md shadow-[var(--primary)]/20
                            focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                        "
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating reset link...</span>
                            </>
                        ) : (
                            <>
                                <span>Dispatch Recovery Instructions</span>
                                <FiArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link
                            to="/login"
                            className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Remember your credentials? <span className="text-[var(--primary)] font-bold">Sign in</span>
                        </Link>
                    </div>
                </form>
            )}
        </AuthSplitLayout>
    );
};

export default ForgotPasswordPage;
