import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FiUser, FiPhone, FiHome, FiCheck, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import RegisterProgressBar from './register/components/RegisterProgressBar';
import AccountStep from './register/components/AccountStep';
import ContactStep from './register/components/ContactStep';
import AddressStep from './register/components/AddressStep';
import SocialAuthButtons from './register/components/SocialAuthButtons';

const RegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    // Get redirect path from location state
    const fromState = location.state?.from;
    const from = typeof fromState === 'string' ? fromState : fromState?.pathname || '/';

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Ethiopia'
        }
    });

    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Validation errors
    const [errors, setErrors] = useState({});

    const getServerErrorMessage = (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data || {};

        if (Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors[0]?.msg || data.errors[0]?.message || 'Please fix the errors in the form';
        }

        if (status === 400) return data.message || 'Please fix the errors in the form';
        if (status === 429) return data.message || 'Too many attempts. Please try again later.';

        return data.message || 'Registration failed';
    };

    // Password strength calculation
    useEffect(() => {
        let strength = 0;
        const password = form.password;

        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

        setPasswordStrength(Math.min(strength, 5));
    }, [form.password]);

    // Validate form field
    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';

            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
                return '';

            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                if (!/^\+?[\d\s-]{10,}$/.test(value)) return 'Phone number is invalid';
                return '';

            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                if (passwordStrength < 3) return 'Password is too weak';
                return '';

            case 'confirmPassword':
                if (!value) return 'Please confirm your password';
                if (value !== form.password) return 'Passwords do not match';
                return '';

            case 'zipCode':
                if (value && !/^(\d{4,6}|\d{5}(-\d{4})?)$/.test(value)) {
                    return 'ZIP code is invalid';
                }
                return '';

            default:
                return '';
        }
    };

    // Handle field change
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setForm(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent] || {}),
                    [child]: value
                }
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));

        if (name === 'password' && form.confirmPassword) {
            const confirmError = validateField('confirmPassword', form.confirmPassword);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    // Handle field blur
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // Validate current step before proceeding
    const validateStep = (stepNumber) => {
        const stepErrors = {};
        if (stepNumber === 1) {
            const fields = ['name', 'password', 'confirmPassword'];
            fields.forEach(f => {
                const err = validateField(f, form[f]);
                if (err) stepErrors[f] = err;
            });
        } else if (stepNumber === 2) {
            const fields = ['email', 'phone'];
            fields.forEach(f => {
                const err = validateField(f, form[f]);
                if (err) stepErrors[f] = err;
            });
        } else if (stepNumber === 3) {
            if (form.address.zipCode) {
                const err = validateField('zipCode', form.address.zipCode);
                if (err) stepErrors.zipCode = err;
            }
        }

        if (Object.keys(stepErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...stepErrors }));
            const touchedFields = {};
            Object.keys(stepErrors).forEach(k => { touchedFields[k] = true; });
            setTouched(prev => ({ ...prev, ...touchedFields }));
            const firstErr = Object.values(stepErrors)[0];
            toast.error(firstErr);
            return false;
        }

        return true;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword'];

        fieldsToValidate.forEach(field => {
            const error = validateField(field, form[field]);
            if (error) newErrors[field] = error;
        });

        if (form.address.zipCode) {
            const zipError = validateField('zipCode', form.address.zipCode);
            if (zipError) newErrors.zipCode = zipError;
        }

        setErrors(newErrors);

        const allTouched = {};
        fieldsToValidate.forEach(field => { allTouched[field] = true; });
        setTouched(allTouched);

        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors).find(Boolean);
            toast.error(firstError || 'Please fix the errors in the form');
            return;
        }

        if (!acceptedTerms) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        setSubmitting(true);

        try {
            await register({
                name: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                address: form.address
            });

            toast.success('Account created successfully! Welcome to Food Hub.', {
                icon: '🎉',
                duration: 5000
            });

            navigate(from, { replace: true });
        } catch (error) {
            toast.error(getServerErrorMessage(error), {
                icon: '❌',
                duration: 4000
            });
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { number: 1, name: 'Account', icon: FiUser },
        { number: 2, name: 'Contact', icon: FiPhone },
        { number: 3, name: 'Address', icon: FiHome },
    ];

    return (
        <AuthSplitLayout
            portalType="client"
            badge="NEW MEMBER"
            title="Create your account"
            subtitle="Join Food Hub to unlock personalized dining recommendations, lightning delivery, and order tracking."
            backTo="/login"
            backLabel="Back to Login"
            heroTitle="Join Food Hub & Taste the Difference"
            heroSubtitle="Create your free account today to enjoy member discounts, live order tracking, and save your favorite dining spots."
            heroHighlights={[
                'Instant access to 500+ top-rated artisan restaurants',
                'Real-time courier GPS telematics and live order status',
                'Complimentary free delivery on your inaugural orders'
            ]}
            heroMetrics={[
                { label: 'Foodie Community', value: '50k+' },
                { label: 'Avg Fulfillment', value: '24 min' },
                { label: 'Platform Rating', value: '4.9 ★' }
            ]}
        >
            {/* Multi-step progress bar */}
            <RegisterProgressBar steps={steps} currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <AccountStep
                            form={form}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                            passwordStrength={passwordStrength}
                        />
                    )}

                    {currentStep === 2 && (
                        <ContactStep
                            form={form}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                        />
                    )}

                    {currentStep === 3 && (
                        <AddressStep
                            form={form}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            touched={touched}
                            errors={errors}
                        />
                    )}
                </AnimatePresence>

                {/* Terms and Conditions (Step 3 or always visible) */}
                {currentStep === 3 && (
                    <div className="flex items-start gap-2.5 pt-2">
                        <input
                            type="checkbox"
                            id="reg-terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)] cursor-pointer"
                        />
                        <label htmlFor="reg-terms" className="text-xs text-[var(--muted-foreground)] leading-relaxed select-none">
                            I agree to the{' '}
                            <span className="text-[var(--primary)] font-semibold hover:underline cursor-pointer">
                                Terms of Service
                            </span>{' '}
                            and{' '}
                            <span className="text-[var(--primary)] font-semibold hover:underline cursor-pointer">
                                Privacy Policy
                            </span>
                        </label>
                    </div>
                )}

                {/* Wizard Navigation Buttons */}
                <div className="flex items-center gap-3 pt-3">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="
                                h-11 px-5 border border-[var(--border)]
                                text-[var(--foreground)] rounded-xl font-bold text-sm
                                bg-[var(--card)] hover:bg-[var(--muted)]/50
                                focus:outline-none focus:ring-2 focus:ring-[var(--border)]
                                transition-all duration-200 cursor-pointer shadow-xs
                            "
                        >
                            Back
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="
                                flex-1 h-11 px-4 bg-[var(--primary)] hover:brightness-110 active:scale-[0.99]
                                text-white rounded-xl font-bold text-sm shadow-md shadow-[var(--primary)]/20
                                focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25
                                transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                            "
                        >
                            <span>Continue</span>
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                                flex-1 h-11 px-4 bg-[var(--primary)] hover:brightness-110 active:scale-[0.99]
                                text-white rounded-xl font-bold text-sm shadow-md shadow-[var(--primary)]/20
                                focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                            "
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <FiCheck className="w-4 h-4" />
                                    <span>Complete Registration</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Social Registration */}
                {currentStep === 1 && (
                    <SocialAuthButtons label="Sign up with Google" redirectTo={from} />
                )}

                {/* Sign in link */}
                <div className="text-center pt-2">
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            state={{ from }}
                            className="font-bold text-[var(--primary)] hover:underline underline-offset-4 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </AuthSplitLayout>
    );
};

export default RegisterPage;
