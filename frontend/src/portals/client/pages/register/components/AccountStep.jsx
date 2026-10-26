import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiUser, FiLock } from 'react-icons/fi';
import PasswordStrengthMeter from '../../../components/auth/PasswordStrengthMeter';
import AuthInput from '@/components/auth/AuthInput';

const AccountStep = ({
    form,
    handleChange,
    handleBlur,
    touched,
    errors,
    passwordStrength
}) => {
    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
        >
            {/* Full Name */}
            <AuthInput
                id="reg-name"
                name="name"
                label="Full Name"
                type="text"
                placeholder="Abebe Kebede"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="name"
                icon={FiUser}
                error={touched.name ? errors.name : ''}
            />

            {/* Password */}
            <div className="space-y-1.5">
                <AuthInput
                    id="reg-password"
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                    icon={FiLock}
                    error={touched.password ? errors.password : ''}
                />

                {/* Password strength meter */}
                {form.password && (
                    <div className="pt-1">
                        <PasswordStrengthMeter strength={passwordStrength} />
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <AuthInput
                id="reg-confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="new-password"
                icon={FiLock}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
            />
        </motion.div>
    );
};

AccountStep.propTypes = {
    form: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    touched: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    passwordStrength: PropTypes.number.isRequired
};

export default AccountStep;
