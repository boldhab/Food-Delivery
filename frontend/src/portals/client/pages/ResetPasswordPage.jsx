import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import AuthInput from '@/components/auth/AuthInput';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import authService from '../services/auth.service';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Password strength calculation
    useEffect(() => {
        let strength = 0;
        const password = form.newPassword;

        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

        setPasswordStrength(Math.min(strength, 5));
    }, [form.newPassword]);

    const validate = () => {
        const errs = {};
        if (!form.newPassword) {
            errs.newPassword = 'New password is required';
        } else if (form.newPassword.length < 6) {
            errs.newPassword = 'Password must be at least 6 characters';
        }

        if (!form.confirmPassword) {
            errs.confirmPassword = 'Please confirm your new password';
        } else if (form.confirmPassword !== form.newPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting || !validate()) return;

        if (!token) {
            toast.error('Reset token is missing. Please use the link provided in your email.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await authService.resetPassword({
                token,
                newPassword: form.newPassword
            });
            setIsSuccess(true);
            toast.success(res?.message || 'Password reset successful!');
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2500);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
            toast.error(msg);
            setErrors({ general: msg });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthSplitLayout
            portalType="client"
            badge="CREDENTIAL RESET"
            title="Create a new password"
            subtitle="Enter and confirm your new account password to restore access."
            backTo="/login"
            backLabel="Back to Login"
            heroTitle="Secure Your Food Hub Account"
            heroSubtitle="Choose a strong, unique password to keep your account, favorites, and saved delivery addresses safe."
            heroHighlights={[
                'Strong password encryption and protected sessions',
                'Instant reset of security lockout cooldowns',
                'Seamless access restoration across all your devices'
            ]}
            heroMetrics={[
                { label: 'Security Level', value: 'High' },
                { label: 'Min Length', value: '6 chars' },
                { label: 'Lockout State', value: 'Cleared' }
            ]}
        >
            {!token ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[var(--foreground)] space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                        <FiAlertCircle className="w-5 h-5 shrink-0" />
                        <span>Missing Reset Token</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        A valid password reset token is required to reset your credentials. Please request a new recovery link.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider"
                    >
                        <span>Request Password Reset Link</span>
                        <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : isSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--foreground)] space-y-3 animate-fadeIn text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <FiCheckCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-[var(--foreground)]">
                        Password Reset Successfully!
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        Your password has been updated. Redirecting you to sign in...
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider"
                    >
                        <span>Sign In Now</span>
                        <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {errors.general && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                            <FiAlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <AuthInput
                            id="reset-new-password"
                            name="newPassword"
                            label="New Password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={form.newPassword}
                            onChange={(e) => {
                                setForm({ ...form, newPassword: e.target.value });
                                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                            }}
                            required
                            autoComplete="new-password"
                            icon={FiLock}
                            error={errors.newPassword}
                            disabled={submitting}
                        />

                        {form.newPassword && (
                            <div className="pt-1">
                                <PasswordStrengthMeter strength={passwordStrength} />
                            </div>
                        )}
                    </div>

                    <AuthInput
                        id="reset-confirm-password"
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                        placeholder="Re-enter your new password"
                        value={form.confirmPassword}
                        onChange={(e) => {
                            setForm({ ...form, confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                        required
                        autoComplete="new-password"
                        icon={FiLock}
                        error={errors.confirmPassword}
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
                                <span>Updating password...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirm Password Reset</span>
                                <FiArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <Link
                            to="/login"
                            className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Nevermind, return to <span className="text-[var(--primary)] font-bold">Sign in</span>
                        </Link>
                    </div>
                </form>
            )}
        </AuthSplitLayout>
    );
};

export default ResetPasswordPage;
