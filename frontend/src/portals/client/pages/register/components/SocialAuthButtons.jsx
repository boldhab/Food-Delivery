import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';

const SocialAuthButtons = ({ label = 'Continue with Google', redirectTo = '/' }) => {
    const navigate = useNavigate();
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

    const handleGoogleSuccess = () => {
        navigate(redirectTo, { replace: true });
    };

    return (
        <div className="pt-2">
            {/* Divider */}
            <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[var(--background)] text-[var(--muted-foreground)] text-[11px] font-semibold tracking-wide uppercase">
                        Or continue with
                    </span>
                </div>
            </div>

            {/* Google-only Authentication Button */}
            <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                aria-label={label}
                className="w-full h-11 px-4 flex items-center justify-center gap-3 border border-[var(--border)] rounded-xl bg-[var(--card)] hover:bg-[var(--muted)]/50 hover:border-[var(--primary)]/40 text-sm font-semibold text-[var(--foreground)] transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.99]"
            >
                <FcGoogle className="w-5 h-5 shrink-0" />
                <span>{label}</span>
            </button>

            {/* Google Authentication Dialog */}
            <GoogleAuthModal
                isOpen={isGoogleModalOpen}
                onClose={() => setIsGoogleModalOpen(false)}
                onSuccess={handleGoogleSuccess}
            />
        </div>
    );
};

SocialAuthButtons.propTypes = {
    label: PropTypes.string,
    redirectTo: PropTypes.string
};

export default SocialAuthButtons;
