import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);
    const fromState = location.state?.from;
    const redirectTo = typeof fromState === 'string' ? fromState : fromState?.pathname || '/';

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting || retryAfter > 0) return;
        setSubmitting(true);
        try {
            await login(form);
            toast.success('Welcome back');
            navigate(redirectTo, { replace: true });
        } catch (error) {
            if (error?.response?.status === 429) {
                const retryHeader = Number(error?.response?.headers?.['retry-after']);
                const waitSeconds = Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : 30;
                setRetryAfter(waitSeconds);
                toast.error(`Too many attempts. Try again in ${waitSeconds}s.`);
            } else {
            toast.error(error.response?.data?.message || 'Login failed');
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

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                />
                <button type="submit" disabled={submitting || retryAfter > 0}>
                    {submitting ? 'Signing in...' : retryAfter > 0 ? `Retry in ${retryAfter}s` : 'Login'}
                </button>
                <p>
                    Don&apos;t have an account? <Link to="/register" state={{ from: redirectTo }}>Register</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
