import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiMail, FiPhone } from 'react-icons/fi';
import AuthInput from '@/components/auth/AuthInput';

const ContactStep = ({
    form,
    handleChange,
    handleBlur,
    touched,
    errors
}) => {
    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
        >
            {/* Email */}
            <AuthInput
                id="reg-email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="abebe.kebede@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="email"
                icon={FiMail}
                error={touched.email ? errors.email : ''}
            />

            {/* Phone */}
            <AuthInput
                id="reg-phone"
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+251 91 123 4567"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="tel"
                icon={FiPhone}
                error={touched.phone ? errors.phone : ''}
            />
        </motion.div>
    );
};

ContactStep.propTypes = {
    form: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    touched: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

export default ContactStep;
