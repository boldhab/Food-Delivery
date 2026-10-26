import React from 'react';
import { Link } from 'react-router-dom';
import { 
    FiMapPin, 
    FiPhone, 
    FiMail, 
    FiClock,
    FiFacebook, 
    FiTwitter, 
    FiInstagram, 
    FiYoutube, 
    FiGithub, 
    FiHeart 
} from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Our Mission & Story', href: '/about' },
                { label: 'Explore Menu', href: '/menu' },
                { label: 'Become a Driver Partner', href: '/driver/apply' },
            ]
        },
        {
            title: 'Discover',
            links: [
                { label: 'Handcrafted Dishes', href: '/menu' },
                { label: 'Artisan Kitchens', href: '/menu' },
                { label: 'Quality Standards', href: '/about' },
                { label: 'Courier Portal', href: '/driver/login' },
            ]
        },
        {
            title: 'Support & Legal',
            links: [
                { label: 'Help & Customer Care', href: '/about' },
                { label: 'Driver Status & Tracking', href: '/driver/apply' },
                { label: 'Terms of Service', href: '/about' },
                { label: 'Privacy Policy', href: '/about' },
            ]
        }
    ];

    const socialLinks = [
        { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook' },
        { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
        { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube' },
        { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    ];

    const contactInfo = [
        { icon: FiMapPin, text: 'Bole Road, Mega Building, Addis Ababa, Ethiopia' },
        { icon: FiPhone, text: '+251 91 123 4567' },
        { icon: FiMail, text: 'support@foodiehub.com' },
        { icon: FiClock, text: '24/7 Culinary Delivery & Support' },
    ];

    return (
        <footer className="bg-[var(--card)] border-t border-[var(--border)] text-[var(--foreground)]">
            {/* Main Footer */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12 lg:py-16">
                {/* Top Section - Brand and Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b border-[var(--border)]">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2.5 group">
                            <img 
                                src="/LOGO.png" 
                                alt="Food Hub Logo" 
                                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-amber-500 
                                         bg-clip-text text-transparent">
                                Food Hub
                            </span>
                        </Link>
                        <p className="text-[var(--muted-foreground)] max-w-md text-sm leading-relaxed">
                            Delivering happiness to your doorstep. Choose from curated top restaurants and track your order in real-time.
                        </p>
                        
                        {/* Contact Info */}
                        <div className="space-y-2 pt-4">
                            {contactInfo.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                                    <item.icon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter Signup */}
                    <div className="lg:pl-12">
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                            Get the latest updates
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">
                            Subscribe to our newsletter for exclusive deals, chef specials, and new kitchen alerts.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 bg-[var(--background)]
                                         border border-[var(--border)]
                                         rounded-xl text-[var(--foreground)]
                                         placeholder:text-[var(--muted-foreground)]/60
                                         focus:outline-none focus:border-[var(--primary)]
                                         focus:ring-2 focus:ring-[var(--primary)]/20
                                         transition-all duration-200"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[var(--primary)] hover:opacity-90
                                         text-white font-bold rounded-xl
                                         transition-all duration-200
                                         shadow-lg shadow-[var(--primary)]/25 cursor-pointer"
                            >
                                Subscribe
                            </button>
                        </form>
                        
                        {/* Trust Badge */}
                        <div className="flex items-center gap-4 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-950/30 
                                              rounded-full flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 text-lg">🔒</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Secure & encrypted
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/30 
                                              rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-400 text-lg">💳</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Multiple payments
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links Grid */}
                <div className="py-10 grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-[var(--border)]">
                    {footerSections.map((section, idx) => (
                        <div key={idx} className="space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)]">
                                {section.title}
                            </h4>
                            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link 
                                            to={link.href}
                                            className="hover:text-[var(--primary)] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <div className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
                        © {currentYear} Food Hub. All rights reserved. 
                        <span className="inline-flex items-center gap-1 ml-1">
                            Made with <FiHeart className="text-red-500 inline" /> for food lovers
                        </span>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-[var(--primary)] 
                                         transition-colors duration-200"
                                aria-label={social.label}
                            >
                                <social.icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            We accept
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg" title="Visa">💳</span>
                            <span className="text-lg" title="Mastercard">💳</span>
                            <span className="text-lg" title="PayPal">📱</span>
                            <span className="text-lg" title="Apple Pay">🍎</span>
                            <span className="text-lg" title="Google Pay">📱</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;