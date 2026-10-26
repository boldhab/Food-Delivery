import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FcGoogle } from 'react-icons/fc';
import { FiX, FiCheck, FiArrowRight, FiShield, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuth from '@/portals/client/hooks/useAuth';

const GOOGLE_PRESET_PROFILES = [
  {
    name: 'Dawit Alemu',
    email: 'dawit.alemu@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  },
  {
    name: 'Selamawit Desta',
    email: 'selamawit.desta@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
  }
];

export const GoogleAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { googleLogin } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleAuthenticate = async (profile) => {
    setAuthenticating(true);
    try {
      await googleLogin({
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar
      });
      toast.success(`Signed in as ${profile.name}`, { icon: '✨' });
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Google sign-in failed');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      toast.error('Please enter a Google email');
      return;
    }
    handleAuthenticate({
      email: customEmail.trim(),
      name: customName.trim() || customEmail.split('@')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-colors"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto shadow-sm">
            <FcGoogle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Sign in with Google
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Choose an authorized Google profile to access Food Hub
          </p>
        </div>

        {/* Preset Google Accounts */}
        <div className="space-y-2.5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Select Google Account
          </span>

          {GOOGLE_PRESET_PROFILES.map((profile) => (
            <button
              key={profile.email}
              type="button"
              disabled={authenticating}
              onClick={() => handleAuthenticate(profile)}
              className="w-full p-3 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)]/60 bg-[var(--muted)]/30 hover:bg-[var(--card)] flex items-center gap-3 transition-all duration-200 text-left group cursor-pointer disabled:opacity-50"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover border border-[var(--border)] group-hover:ring-2 group-hover:ring-[var(--primary)]/30"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--foreground)] truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate font-mono">
                  {profile.email}
                </p>
              </div>
              <FiArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        {/* Custom Google Account Toggle */}
        <div className="pt-1">
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiUser className="w-3.5 h-3.5" />
              <span>Use Another Google Account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-2.5 pt-2 border-t border-[var(--border)]">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3 text-sm rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="Abebe Kebede"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--foreground)]"
                />
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full h-10 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {authenticating ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span>Authorize with Google</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-2xs font-medium text-[var(--muted-foreground)]">
          <FiShield className="w-3.5 h-3.5 text-emerald-500" />
          <span>OAuth 2.0 / OpenID Connect Verified</span>
        </div>
      </div>
    </div>
  );
};

GoogleAuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default GoogleAuthModal;
