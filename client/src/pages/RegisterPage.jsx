import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUser, 
    FiMail, 
    FiPhone, 
    FiLock, 
    FiHome,
    FiMapPin,
    FiGlobe,
    FiEye,
    FiEyeOff,
    FiCheck,
    FiX,
    FiAlertCircle,
    FiArrowLeft,
    FiGithub,
    FiTwitter,
    FiFacebook
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';

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
            country: 'USA'
        }
    });

    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Validation errors
    const [errors, setErrors] = useState({});

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

    // Validate form
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
                if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
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
            // Handle nested fields (address)
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

        // Validate field
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));

        // Clear confirm password error when password changes
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

    // Check if form is valid
    const isFormValid = () => {
        const fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword'];
        
        for (const field of fieldsToValidate) {
            const error = validateField(field, form[field]);
            if (error) return false;
        }
        
        if (!acceptedTerms) return false;
        
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const newErrors = {};
        const fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword'];
        
        fieldsToValidate.forEach(field => {
            const error = validateField(field, form[field]);
            if (error) newErrors[field] = error;
        });

        // Validate address fields (optional but validate if provided)
        if (form.address.zipCode) {
            const zipError = validateField('zipCode', form.address.zipCode);
            if (zipError) newErrors.zipCode = zipError;
        }

        setErrors(newErrors);
        
        // Mark all fields as touched
        const allTouched = {};
        fieldsToValidate.forEach(field => { allTouched[field] = true; });
        setTouched(allTouched);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors in the form');
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
            
            toast.success('Account created successfully!', {
                icon: '🎉',
                duration: 5000
            });
            
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed', {
                icon: '❌',
                duration: 4000
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle social registration
    const handleSocialRegister = (provider) => {
        toast.success(`${provider} registration coming soon!`, {
            icon: '🚀'
        });
    };

    // Steps configuration
    const steps = [
        { number: 1, name: 'Account', icon: FiUser },
        { number: 2, name: 'Contact', icon: FiPhone },
        { number: 3, name: 'Address', icon: FiHome },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 py-12">
            <div className="max-w-md mx-auto px-4">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-slate-600 dark:text-slate-400
                             hover:text-green-500 transition-colors"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step) => (
                            <div key={step.number} className="flex-1 text-center">
                                <div className="relative">
                                    <div className={`
                                        w-10 h-10 mx-auto rounded-full flex items-center justify-center
                                        transition-all duration-300
                                        ${currentStep > step.number 
                                            ? 'bg-green-500 text-white' 
                                            : currentStep === step.number
                                            ? 'bg-green-500 text-white ring-4 ring-green-500/20'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                        }
                                    `}>
                                        {currentStep > step.number ? (
                                            <FiCheck className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs
                                                   text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {step.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="relative mt-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Registration Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl 
                             border border-slate-200 dark:border-slate-700
                             overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Create your account
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Join FoodDash and start ordering your favorite meals
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Account Info */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="John Doe"
                                                    className={`
                                                        w-full pl-10 pr-4 py-3 rounded-xl
                                                        border transition-colors duration-200
                                                        ${touched.name && errors.name
                                                            ? 'border-red-500 focus:ring-red-200' 
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                        }
                                                        dark:bg-slate-900 dark:text-white
                                                    `}
                                                />
                                                {touched.name && errors.name && (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Create a password"
                                                    className={`
                                                        w-full pl-10 pr-12 py-3 rounded-xl
                                                        border transition-colors duration-200
                                                        ${touched.password && errors.password
                                                            ? 'border-red-500 focus:ring-red-200' 
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                        }
                                                        dark:bg-slate-900 dark:text-white
                                                    `}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                            
                                            {/* Password strength meter */}
                                            {form.password && (
                                                <div className="mt-2">
                                                    <PasswordStrengthMeter strength={passwordStrength} />
                                                </div>
                                            )}
                                            
                                            {touched.password && errors.password && (
                                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={form.confirmPassword}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Confirm your password"
                                                    className={`
                                                        w-full pl-10 pr-12 py-3 rounded-xl
                                                        border transition-colors duration-200
                                                        ${touched.confirmPassword && errors.confirmPassword
                                                            ? 'border-red-500 focus:ring-red-200' 
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                        }
                                                        dark:bg-slate-900 dark:text-white
                                                    `}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                >
                                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                            {touched.confirmPassword && errors.confirmPassword && (
                                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Contact Info */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="you@example.com"
                                                    className={`
                                                        w-full pl-10 pr-4 py-3 rounded-xl
                                                        border transition-colors duration-200
                                                        ${touched.email && errors.email
                                                            ? 'border-red-500 focus:ring-red-200' 
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                        }
                                                        dark:bg-slate-900 dark:text-white
                                                    `}
                                                />
                                                {touched.email && errors.email && (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={form.phone}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="(555) 123-4567"
                                                    className={`
                                                        w-full pl-10 pr-4 py-3 rounded-xl
                                                        border transition-colors duration-200
                                                        ${touched.phone && errors.phone
                                                            ? 'border-red-500 focus:ring-red-200' 
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                        }
                                                        dark:bg-slate-900 dark:text-white
                                                    `}
                                                />
                                                {touched.phone && errors.phone && (
                                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Address */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        {/* Street */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Street Address
                                            </label>
                                            <div className="relative">
                                                <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="address.street"
                                                    value={form.address.street}
                                                    onChange={handleChange}
                                                    placeholder="123 Main St"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl
                                                             border border-slate-200 dark:border-slate-700
                                                             dark:bg-slate-900 dark:text-white
                                                             focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* City */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                City
                                            </label>
                                            <div className="relative">
                                                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="address.city"
                                                    value={form.address.city}
                                                    onChange={handleChange}
                                                    placeholder="New York"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl
                                                             border border-slate-200 dark:border-slate-700
                                                             dark:bg-slate-900 dark:text-white
                                                             focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* State and ZIP */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    State
                                                </label>
                                                <div className="relative">
                                                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        name="address.state"
                                                        value={form.address.state}
                                                        onChange={handleChange}
                                                        placeholder="NY"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl
                                                                 border border-slate-200 dark:border-slate-700
                                                                 dark:bg-slate-900 dark:text-white
                                                                 focus:border-green-500 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    ZIP Code
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address.zipCode"
                                                    value={form.address.zipCode}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="10001"
                                                    className={`
                                                        w-full px-4 py-3 rounded-xl
                                                        border transition-colors duration-200
                                                        ${touched.zipCode && errors.zipCode
                                                            ? 'border-red-500 focus:ring-red-200' 
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-green-500'
                                                        }
                                                        dark:bg-slate-900 dark:text-white
                                                    `}
                                                />
                                                {touched.zipCode && errors.zipCode && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Country */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Country
                                            </label>
                                            <select
                                                name="address.country"
                                                value={form.address.country}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl
                                                         border border-slate-200 dark:border-slate-700
                                                         dark:bg-slate-900 dark:text-white
                                                         focus:border-green-500 transition-colors"
                                            >
                                                <option value="USA">United States</option>
                                                <option value="CAN">Canada</option>
                                                <option value="UK">United Kingdom</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 pt-4">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700
                                                 text-slate-700 dark:text-slate-300 rounded-xl
                                                 hover:bg-slate-50 dark:hover:bg-slate-700
                                                 transition-colors duration-200"
                                    >
                                        Back
                                    </button>
                                )}
                                
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl
                                                 hover:bg-green-600 transition-colors duration-200
                                                 font-medium"
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={submitting || !isFormValid()}
                                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl
                                                 hover:bg-green-600 transition-colors duration-200
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 font-medium flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 
                                                              border-t-white rounded-full animate-spin" />
                                                <span>Creating account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck className="w-5 h-5" />
                                                <span>Create Account</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-green-500 border-slate-300 rounded
                                             focus:ring-green-500"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-green-500 hover:text-green-600">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-green-500 hover:text-green-600">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Social Registration */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-slate-800 text-slate-500">
                                        Or register with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSocialRegister('Google')}
                                    className="p-3 border border-slate-200 dark:border-slate-700
                                             rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors duration-200"
                                >
                                    <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mx-auto" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialRegister('Facebook')}
                                    className="p-3 border border-slate-200 dark:border-slate-700
                                             rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors duration-200"
                                >
                                    <FiFacebook className="w-5 h-5 mx-auto text-blue-600" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialRegister('GitHub')}
                                    className="p-3 border border-slate-200 dark:border-slate-700
                                             rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700
                                             transition-colors duration-200"
                                >
                                    <FiGithub className="w-5 h-5 mx-auto" />
                                </button>
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    state={{ from }}
                                    className="text-green-500 hover:text-green-600 font-medium
                                             transition-colors duration-200"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
