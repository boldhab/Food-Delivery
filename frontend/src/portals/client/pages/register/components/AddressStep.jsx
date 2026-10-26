import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiHome, FiMapPin, FiGlobe } from 'react-icons/fi';
import AuthInput from '@/components/auth/AuthInput';

const AddressStep = ({
    form,
    handleChange,
    handleBlur,
    touched,
    errors
}) => {
    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
        >
            {/* Street */}
            <AuthInput
                id="reg-street"
                name="address.street"
                label="Street Address"
                type="text"
                placeholder="Bole Road, House 102"
                value={form.address.street}
                onChange={handleChange}
                icon={FiHome}
                autoComplete="street-address"
            />

            {/* City */}
            <AuthInput
                id="reg-city"
                name="address.city"
                label="City"
                type="text"
                placeholder="Addis Ababa"
                value={form.address.city}
                onChange={handleChange}
                icon={FiMapPin}
                autoComplete="address-level2"
            />

            {/* State and ZIP */}
            <div className="grid grid-cols-2 gap-3">
                <AuthInput
                    id="reg-state"
                    name="address.state"
                    label="State / Region"
                    type="text"
                    placeholder="Addis Ababa"
                    value={form.address.state}
                    onChange={handleChange}
                    icon={FiGlobe}
                    autoComplete="address-level1"
                />

                <AuthInput
                    id="reg-zipCode"
                    name="address.zipCode"
                    label="Postal / ZIP Code"
                    type="text"
                    placeholder="1000"
                    value={form.address.zipCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.zipCode ? errors.zipCode : ''}
                    autoComplete="postal-code"
                />
            </div>

            {/* Country */}
            <div className="space-y-1.5 text-left">
                <label
                    htmlFor="reg-country"
                    className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-90 select-none"
                >
                    Country
                </label>
                <div className="relative">
                    <select
                        id="reg-country"
                        name="address.country"
                        value={form.address.country}
                        onChange={handleChange}
                        className="
                            w-full h-11 px-3.5 text-sm rounded-xl
                            bg-[var(--card)] text-[var(--foreground)]
                            border border-[var(--border)]
                            focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none
                            hover:border-[var(--primary)]/50
                            transition-all duration-200
                            cursor-pointer
                        "
                    >
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
};

AddressStep.propTypes = {
    form: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    touched: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

export default AddressStep;
