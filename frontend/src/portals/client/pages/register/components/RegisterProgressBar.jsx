import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const RegisterProgressBar = ({ steps, currentStep }) => {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                {steps.map((step) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const Icon = step.icon;

                    return (
                        <div key={step.number} className="flex-1 text-center">
                            <div className="relative">
                                <div
                                    className={`
                                        w-9 h-9 mx-auto rounded-xl flex items-center justify-center font-bold text-xs
                                        transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : isCurrent
                                            ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20 shadow-xs'
                                            : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]'
                                        }
                                    `}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {isCompleted ? (
                                        <FiCheck className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>
                                <span className={`
                                    block mt-1 text-[11px] font-mono tracking-wider uppercase
                                    ${isCurrent ? 'text-[var(--primary)] font-bold' : 'text-[var(--muted-foreground)]'}
                                `}>
                                    {step.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Progress bar line */}
            <div className="relative mt-3 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--primary)] to-orange-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
};

RegisterProgressBar.propTypes = {
    steps: PropTypes.arrayOf(
        PropTypes.shape({
            number: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            icon: PropTypes.elementType.isRequired
        })
    ).isRequired,
    currentStep: PropTypes.number.isRequired
};

export default RegisterProgressBar;
