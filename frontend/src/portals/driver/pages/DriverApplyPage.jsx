import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiTruck,
  FiCheck,
  FiArrowRight,
  FiShield,
  FiMapPin,
  FiFileText,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useDriverAuth } from '../context/DriverAuthContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// Demo sample applications to preview the tracker
const DEMO_APPLICATIONS = {
  'FH-DRV-849201': {
    refId: 'FH-DRV-849201',
    email: 'marcus.driver@foodiehub.com',
    name: 'Dawit Alemu',
    vehicleType: 'E-Bike Express',
    city: 'Addis Ababa, Bole',
    status: 'In Review',
    statusColor: 'amber',
    steps: [
      { id: 1, title: 'Application Submitted', desc: 'Profile received', done: true, time: 'Oct 23' },
      { id: 2, title: 'Document & Background Check', desc: 'ID and record screening in progress', current: true, time: 'In Progress' },
      { id: 3, title: 'Welcome Gear Delivery', desc: 'Thermal bag shipping', pending: true, time: 'Pending' },
      { id: 4, title: 'Account Activated', desc: 'Ready for live delivery dispatch', pending: true, time: 'Pending' }
    ]
  },
  'FH-DRV-784119': {
    refId: 'FH-DRV-784119',
    email: 'elena.courier@foodiehub.com',
    name: 'Tigist Mengistu',
    vehicleType: 'Scooter',
    city: 'Addis Ababa, Kazanchis',
    status: 'Gear Shipped',
    statusColor: 'blue',
    steps: [
      { id: 1, title: 'Application Submitted', desc: 'Profile received', done: true, time: 'Oct 22' },
      { id: 2, title: 'Document & Background Check', desc: 'Background check cleared', done: true, time: 'Oct 22' },
      { id: 3, title: 'Welcome Gear Delivery', desc: 'Tracking #ET-POST-9400-1284. Arriving soon', current: true, time: 'In Transit' },
      { id: 4, title: 'Account Activated', desc: 'Ready for live delivery dispatch', pending: true, time: 'Pending' }
    ]
  },
  'FH-DRV-901842': {
    refId: 'FH-DRV-901842',
    email: 'driver@foodiehub.com',
    name: 'Abebe Bikila',
    vehicleType: 'Motorcycle',
    city: 'Addis Ababa, Sarbet',
    status: 'Approved & Active',
    statusColor: 'emerald',
    steps: [
      { id: 1, title: 'Application Submitted', desc: 'Profile received', done: true, time: 'Oct 20' },
      { id: 2, title: 'Document & Background Check', desc: 'Background check cleared', done: true, time: 'Oct 20' },
      { id: 3, title: 'Welcome Gear Delivery', desc: 'Thermal bag delivered', done: true, time: 'Oct 21' },
      { id: 4, title: 'Account Activated', desc: 'Fleet account enabled for deliveries', done: true, time: 'Active' }
    ]
  }
};

const VEHICLE_OPTIONS = [
  { id: 'Bicycle / E-Bike', label: 'Bicycle / E-Bike', icon: '🚲' },
  { id: 'Scooter', label: 'Scooter', icon: '🛵' },
  { id: 'Motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { id: 'Car', label: 'Car / Sedan', icon: '🚗' }
];

const DriverApplyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { apply } = useDriverAuth();

  // Navigation controlled from the Navbar: 'apply' | 'track' | 'about'
  const [activeTab, setActiveTab] = useState('apply');

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'Bicycle / E-Bike',
    plateNumber: '',
    licenseNumber: '',
    city: 'Addis Ababa',
    state: 'Addis Ababa',
    zipCode: '1000'
  });

  const [formErrors, setFormErrors] = useState({});

  // Tracker State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedApp, setSearchedApp] = useState(DEMO_APPLICATIONS['FH-DRV-849201']);
  const [searchError, setSearchError] = useState('');

  // Load saved applications
  useEffect(() => {
    try {
      const saved = localStorage.getItem('foodiehub_courier_applications');
      if (saved) {
        Object.assign(DEMO_APPLICATIONS, JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for navigation state from Login page (e.g. redirected from under-review alert)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.email) {
      const query = location.state.email.toLowerCase().trim();
      setSearchQuery(query);
      let found = null;
      for (const key of Object.keys(DEMO_APPLICATIONS)) {
        const item = DEMO_APPLICATIONS[key];
        if (item.refId.toLowerCase() === query || item.email.toLowerCase() === query) {
          found = item;
          break;
        }
      }
      if (found) {
        setSearchedApp(found);
      }
    }
  }, [location.state]);

  const validateAll = () => {
    const errs = {};

    // Section 1: Personal
    if (!form.name.trim()) errs.name = 'Full legal name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email address is required';
    if (!form.phone.trim()) errs.phone = 'Mobile phone number is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';

    // Section 2: Vehicle & City
    if (!form.city.trim()) errs.city = 'Operating city is required';
    if (form.vehicleType !== 'Bicycle / E-Bike' && !form.plateNumber.trim()) {
      errs.plateNumber = 'License plate is required for motor vehicles';
    }

    // Section 3: ID & Review
    if (!form.licenseNumber.trim()) errs.licenseNumber = "Driver's license or government ID number is required";
    if (!agreed) errs.terms = 'Please agree to the background screening and courier terms';

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validateAll()) return;

    setSubmitting(true);
    const generatedRef = `FH-DRV-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Call backend API to provision courier account
      await apply({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        vehicleType: form.vehicleType,
        plateNumber: form.plateNumber.trim() || 'N/A-BIKE',
        licenseNumber: form.licenseNumber.trim(),
        street: 'Bole Road, House 102',
        city: form.city.trim(),
        state: form.state.trim() || 'Addis Ababa',
        zipCode: form.zipCode.trim() || '1000'
      });

      // Create tracking record with Under Review status
      const newRecord = {
        refId: generatedRef,
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        vehicleType: form.vehicleType,
        city: `${form.city}, ${form.state}`,
        status: 'In Review',
        statusColor: 'amber',
        steps: [
          { id: 1, title: 'Application Submitted', desc: 'Online profile received', done: true, time: 'Today' },
          { id: 2, title: 'Document & Background Check', desc: 'Screening in progress (12–24h)', current: true, time: 'In Progress' },
          { id: 3, title: 'Welcome Gear Delivery', desc: 'Kit allocated upon approval', pending: true, time: 'Pending' },
          { id: 4, title: 'Account Activated', desc: 'Ready for live delivery dispatch', pending: true, time: 'Pending' }
        ]
      };

      DEMO_APPLICATIONS[generatedRef] = newRecord;
      DEMO_APPLICATIONS[form.email.trim().toLowerCase()] = newRecord;
      try {
        const existing = JSON.parse(localStorage.getItem('foodiehub_courier_applications') || '{}');
        existing[generatedRef] = newRecord;
        existing[form.email.trim().toLowerCase()] = newRecord;
        localStorage.setItem('foodiehub_courier_applications', JSON.stringify(existing));
      } catch {
        // storage fallback
      }

      setSearchedApp(newRecord);
      setSearchQuery(generatedRef);
      setActiveTab('track');
      toast.success('Application submitted! Your dossier is currently under review.', { icon: '⏳' });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchError('');
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSearchError('Please enter your reference ID or email');
      return;
    }

    let found = null;
    for (const key of Object.keys(DEMO_APPLICATIONS)) {
      const item = DEMO_APPLICATIONS[key];
      if (item.refId.toLowerCase() === query || item.email.toLowerCase() === query) {
        found = item;
        break;
      }
    }

    if (found) {
      setSearchedApp(found);
      toast.success(`Showing status for ${found.name}`);
    } else {
      setSearchError(`No application found for "${searchQuery}". Please check your code.`);
    }
  };

  const loadSample = (refId) => {
    const sample = DEMO_APPLICATIONS[refId];
    if (sample) {
      setSearchQuery(refId);
      setSearchedApp(sample);
      setSearchError('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      {/* Top Header with Navigation Bar */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src="/LOGO.png" alt="Food Hub Courier" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-bold text-base tracking-tight">
              Food Hub <span className="text-teal-600 dark:text-teal-400 font-normal">Courier</span>
            </span>
          </Link>

          {/* Nav Items Inside the Navbar */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeTab === 'apply'
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] font-medium'
              }`}
            >
              Apply to Drive
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] font-medium'
              }`}
            >
              Track Application Status
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] font-medium'
              }`}
            >
              Why Drive With Us
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeSwitcher />
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              type="button"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
            </button>
            <Link
              to="/driver/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12 space-y-6">
        {/* ========================================================
            TAB 1: ONE FULL CONTINUOUS APPLICATION FORM
            1. Personal -> 2. Vehicle & City -> 3. ID & Review
            ======================================================== */}
        {activeTab === 'apply' && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Courier Partner Application
              </h1>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Fill in the sections below and submit your courier registration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border)]">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      placeholder="Abebe Kebede"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                    />
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="abebe@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                    />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      placeholder="+251 91 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                    />
                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Create Password *</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                    />
                    {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                    />
                    {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 2: VEHICLE & CITY */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border)]">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Vehicle & Operating City
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">Select Delivery Vehicle *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {VEHICLE_OPTIONS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setForm({ ...form, vehicleType: v.id })}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          form.vehicleType === v.id
                            ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold'
                            : 'border-[var(--border)] hover:bg-[var(--muted)]'
                        }`}
                      >
                        <div className="text-2xl">{v.icon}</div>
                        <div className="text-xs mt-1">{v.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Operating City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Addis Ababa"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                    />
                    {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                  </div>

                  {form.vehicleType !== 'Bicycle / E-Bike' ? (
                    <div>
                      <label className="block text-xs font-semibold mb-1">License Plate Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. AA-3-A1245"
                        value={form.plateNumber}
                        onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] font-mono uppercase outline-none focus:border-teal-500"
                      />
                      {formErrors.plateNumber && <p className="text-xs text-red-500 mt-1">{formErrors.plateNumber}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold mb-1">Region / Subcity</label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-teal-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: ID & REVIEW */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border)]">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                    ID & Legal Agreement
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Driver License or Government ID Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. ET-DRV-987654"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] font-mono outline-none focus:border-teal-500"
                  />
                  {formErrors.licenseNumber && <p className="text-xs text-red-500 mt-1">{formErrors.licenseNumber}</p>}
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-teal-600 rounded"
                    />
                    <span className="text-[var(--muted-foreground)] leading-relaxed">
                      I authorize Food Hub to verify my driving record and background check, and I accept the Courier Terms of Service.
                    </span>
                  </label>
                  {formErrors.terms && <p className="text-xs text-red-500 mt-1">{formErrors.terms}</p>}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Courier Application</span>
                      <FiCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 2: TRACK APPLICATION STATUS
            ======================================================== */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg font-bold">Check Application Progress</h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Enter your Reference Code or Email to view your onboarding milestones.
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="e.g. FH-DRV-849201 or your email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Lookup
                </button>
              </form>

              {searchError && (
                <p className="text-xs text-red-500">{searchError}</p>
              )}

              {/* Sample Quick Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[var(--muted-foreground)] text-2xs">Test with demo applicants:</span>
                <button
                  onClick={() => loadSample('FH-DRV-849201')}
                  className="px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-2xs font-mono cursor-pointer"
                >
                  Dawit (In Review)
                </button>
                <button
                  onClick={() => loadSample('FH-DRV-784119')}
                  className="px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-2xs font-mono cursor-pointer"
                >
                  Tigist (Gear Shipped)
                </button>
                <button
                  onClick={() => loadSample('FH-DRV-901842')}
                  className="px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-2xs font-mono cursor-pointer"
                >
                  Abebe (Active)
                </button>
              </div>
            </div>

            {/* Status Card */}
            {searchedApp && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
                  <div>
                    <span className="text-2xs font-mono bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold px-2 py-0.5 rounded">
                      REF: {searchedApp.refId}
                    </span>
                    <h3 className="text-base font-bold mt-1.5">{searchedApp.name}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {searchedApp.vehicleType} • {searchedApp.city}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${
                      searchedApp.statusColor === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : searchedApp.statusColor === 'blue'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    ● {searchedApp.status}
                  </span>
                </div>

                {/* Vertical Step Progress */}
                <div className="space-y-4 pl-2">
                  {searchedApp.steps.map((st) => (
                    <div key={st.id} className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          st.done
                            ? 'bg-emerald-500 text-white'
                            : st.current
                            ? 'bg-teal-600 text-white ring-4 ring-teal-500/20'
                            : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        }`}
                      >
                        {st.done ? <FiCheck className="w-3.5 h-3.5" /> : st.id}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <h4 className={`text-xs font-semibold ${st.done || st.current ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                            {st.title}
                          </h4>
                          <span className="text-2xs text-[var(--muted-foreground)] font-mono tabular-nums">{st.time}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                {searchedApp.statusColor === 'emerald' && (
                  <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Ready for shifts
                    </span>
                    <Link
                      to="/driver/login"
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Sign In to Driver App</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: WHY DRIVE WITH US
            ======================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-xl font-bold">Why Deliver with Food Hub?</h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Fair pay, complete schedule freedom, and commercial safety coverage on every trip.
                </p>
              </div>

              {/* 4 Clean Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1">
                  <div className="text-lg">💰</div>
                  <div className="text-xs font-bold">100% of Tips Kept</div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Customer tips are 100% passed through directly to you, plus base fare and surge multipliers.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1">
                  <div className="text-lg">⏰</div>
                  <div className="text-xs font-bold">Total Schedule Freedom</div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Deliver whenever you want. No minimum hours, no required shift bookings.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1">
                  <div className="text-lg">🚲</div>
                  <div className="text-xs font-bold">Any Vehicle Accepted</div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Ride a bicycle, e-bike, scooter, motorcycle, or car. Deliver on your own terms.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1">
                  <div className="text-lg">🛡️</div>
                  <div className="text-xs font-bold">Complimentary Insurance</div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Automatic commercial liability and accident protection on every active delivery trip.
                  </p>
                </div>
              </div>

              {/* Basic Requirements */}
              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Courier Requirements
                </h3>
                <ul className="text-xs space-y-1.5 text-[var(--muted-foreground)]">
                  <li>• Must be at least 18 years of age</li>
                  <li>• Valid government photo ID or driver’s license</li>
                  <li>• Smartphone (iOS or Android) with GPS</li>
                  <li>• Pass standard background screening</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('apply')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Start Your Application Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--muted-foreground)] flex flex-col items-center justify-center gap-2">
        <img src="/LOGO.png" alt="Food Hub Courier" className="h-6 w-auto object-contain opacity-80" />
        <p>© {new Date().getFullYear()} Food Hub Fleet Logistics • Dispatch Hotline: +251 11 555 0199</p>
      </footer>
    </div>
  );
};

export default DriverApplyPage;
