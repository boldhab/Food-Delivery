import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message || 'Login failed');
        }

        setSubmitting(false);
    };

    return (
        <div style={{ maxWidth: 420, margin: '4rem auto', padding: '1rem' }}>
            <h1>Admin Login</h1>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
