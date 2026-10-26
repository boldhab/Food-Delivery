import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FiArrowRight, 
    FiCheckCircle, 
    FiClock, 
    FiHeart, 
    FiMapPin, 
    FiShield, 
    FiSmile, 
    FiTruck, 
    FiUsers, 
    FiAward 
} from 'react-icons/fi';

const stats = [
    { value: '50k+', label: 'Happy Foodies Served', icon: FiSmile },
    { value: '150+', label: 'Artisan Kitchen Partners', icon: FiAward },
    { value: '22 min', label: 'Average Delivery Time', icon: FiClock },
    { value: '4.9 ★', label: 'Customer Quality Rating', icon: FiHeart },
];

const values = [
    {
        icon: FiAward,
        title: 'Curated Culinary Quality',
        description: 'Every restaurant and cloud kitchen on Food Hub is hand-vetted for ingredient freshness, hygiene standards, and flavor perfection.'
    },
    {
        icon: FiClock,
        title: 'Precision-Paced Logistics',
        description: 'Our proprietary courier dispatch and live turn-by-turn routing guarantees your meal arrives hot, crisp, and fresh.'
    },
    {
        icon: FiShield,
        title: 'Eco-Friendly & Safe Packaging',
        description: 'We require 100% spill-proof, tamper-evident, and sustainable containers to preserve temperature while protecting our planet.'
    },
    {
        icon: FiUsers,
        title: 'Local Kitchen Community',
        description: 'We empower family-owned bistros, neighborhood gems, and rising culinary artists with zero predatory merchant fees.'
    }
];

const steps = [
    {
        number: '01',
        title: 'Browse Handcrafted Menus',
        description: 'Explore signature pasta, artisan burgers, authentic ramen, and healthy bowls curated by local masters.'
    },
    {
        number: '02',
        title: 'Cooked Fresh On-Demand',
        description: 'Kitchens fire up your meal the moment your order is accepted. No pre-cooked warming trays, ever.'
    },
    {
        number: '03',
        title: 'Sub-Minute Doorstep Delivery',
        description: 'Track your driver live on the map from pan to porch with push notifications every step of the way.'
    }
];

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-16">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                
                <div className="relative max-w-3xl space-y-6">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✨ Our Mission & Story
                    </span>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                        Delivering Culinary Joy & Fresh Flavors Faster.
                    </h1>
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                        Food Hub started with a simple belief: exceptional food should not lose its magic on the ride home. We combine culinary passion with intelligent logistics to bring you neighborhood dining at its absolute peak.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Link
                            to="/menu"
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <span>Explore Our Menu</span>
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/driver/apply"
                            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2 active:scale-95"
                        >
                            <FiTruck className="w-4 h-4 text-emerald-400" />
                            <span>Become a Delivery Partner</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Platform Milestones */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] elevation-1 flex flex-col items-center text-center space-y-2"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xl mb-1">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
                            {stat.value}
                        </span>
                        <span className="text-xs sm:text-sm text-[var(--muted-foreground)] font-medium">
                            {stat.label}
                        </span>
                    </motion.div>
                ))}
            </section>

            {/* Core Values */}
            <section className="space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                        What Drives Us
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)]">
                        Quality You Can Taste, Reliability You Can Count On
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        We obsess over every single detail so your dinner is always the highlight of your day.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.map((v, i) => (
                        <div
                            key={i}
                            className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] elevation-1 flex items-start gap-4 transition-all hover:border-[var(--primary)]/40 hover:elevation-2"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                                <v.icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg text-[var(--foreground)]">
                                    {v.title}
                                </h3>
                                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                                    {v.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="p-8 sm:p-12 rounded-3xl bg-[var(--card)] border border-[var(--border)] elevation-1 space-y-10">
                <div className="text-center max-w-xl mx-auto space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                        The Food Hub Experience
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
                        How We Bring Great Food to Your Door
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {steps.map((step, idx) => (
                        <div key={idx} className="space-y-3 relative">
                            <span className="text-4xl sm:text-5xl font-black text-[var(--primary)]/20 tabular-nums">
                                {step.number}
                            </span>
                            <h3 className="text-lg font-bold text-[var(--foreground)]">
                                {step.title}
                            </h3>
                            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Partner & Courier Call to Action */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <FiTruck className="w-4 h-4" /> Drive & Earn
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                            Join Our Courier Partner Fleet
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                            Enjoy competitive pay with 100% of tips, flexible shifts, and real-time navigation tools designed for delivery champions.
                        </p>
                    </div>
                    <div>
                        <Link
                            to="/driver/apply"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
                        >
                            <span>Apply in 5 Minutes</span>
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            🍕 Hungry for Dinner?
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                            Ready to Taste the Difference?
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                            Discover top-rated pizzas, authentic pastas, decadent desserts, and handcrafted beverages prepared just for you.
                        </p>
                    </div>
                    <div>
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--primary)] hover:opacity-90 text-white shadow-md shadow-[var(--primary)]/20 transition-all"
                        >
                            <span>Order Now</span>
                            <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
