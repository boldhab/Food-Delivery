import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            await register({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                address: {
                    street: form.street,
                    city: form.city,
                    state: form.state,
                    zipCode: form.zipCode,
                },
            });
            toast.success('Account created');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Create account</h1>
                <input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                />
                <input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
                <input
                    type="password"
                    placeholder="Password (min 6)"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                    minLength={6}
                />
                <input placeholder="Street" value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} />
                <input placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
                <input placeholder="State" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
                <input placeholder="ZIP Code" value={form.zipCode} onChange={(event) => setForm({ ...form, zipCode: event.target.value })} />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Register'}
                </button>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
