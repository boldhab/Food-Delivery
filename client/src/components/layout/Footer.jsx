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
            title: 'Discover',
            links: [
                { label: 'Restaurants', path: '/restaurants' },
                { label: 'Cuisines', path: '/cuisines' },
                { label: 'Near Me', path: '/near-me' },
                { label: 'Popular Items', path: '/popular' },
                { label: 'New Arrivals', path: '/new' },
            ]
        },
        {
            title: 'Support',
            links: [
                { label: 'Help Center', path: '/help' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'FAQs', path: '/faqs' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', path: '/about' },
                { label: 'Careers', path: '/careers' },
                { label: 'Press', path: '/press' },
                { label: 'Blog', path: '/blog' },
                { label: 'Affiliates', path: '/affiliates' },
            ]
        },
        {
            title: 'For Partners',
            links: [
                { label: 'Partner with Us', path: '/partner' },
                { label: 'Become a Driver', path: '/driver' },
                { label: 'Become a Restaurant', path: '/restaurant-signup' },
                { label: 'Corporate Orders', path: '/corporate' },
            ]
        }
    ];

    const socialLinks = [
        { icon: FiFacebook, href: 'https://facebook.com/fooddash', label: 'Facebook' },
        { icon: FiTwitter, href: 'https://twitter.com/fooddash', label: 'Twitter' },
        { icon: FiInstagram, href: 'https://instagram.com/fooddash', label: 'Instagram' },
        { icon: FiYoutube, href: 'https://youtube.com/fooddash', label: 'YouTube' },
        { icon: FiGithub, href: 'https://github.com/fooddash', label: 'GitHub' },
    ];

    const contactInfo = [
        { icon: FiMapPin, text: '123 Food Street, Culinary District, NY 10001' },
        { icon: FiPhone, text: '+1 (555) 123-4567' },
        { icon: FiMail, text: 'support@fooddash.com' },
        { icon: FiClock, text: '24/7 Customer Support' },
    ];

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                {/* Top Section - Brand and Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 
                                         bg-clip-text text-transparent">
                                FoodDash
                            </span>
                            <span className="text-2xl transform group-hover:rotate-12 transition-transform duration-300">
                                🍕
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md">
                            Delivering happiness to your doorstep. Choose from 500+ restaurants and track your order in real-time.
                        </p>
                        
                        {/* Contact Info */}
                        <div className="space-y-2 pt-4">
                            {contactInfo.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <item.icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter Signup */}
                    <div className="lg:pl-12">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Get the latest updates
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Subscribe to our newsletter for exclusive deals and new restaurant alerts.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800
                                         border border-slate-200 dark:border-slate-700
                                         rounded-xl text-slate-900 dark:text-white
                                         placeholder:text-slate-400
                                         focus:outline-none focus:border-orange-500
                                         focus:ring-2 focus:ring-orange-500/20
                                         transition-all duration-200"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600
                                         text-white font-medium rounded-xl
                                         transition-colors duration-200
                                         shadow-lg shadow-orange-500/25
                                         hover:shadow-orange-500/35"
                            >
                                Subscribe
                            </button>
                        </form>
                        
                        {/* Trust Badge */}
                        <div className="flex items-center gap-4 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 
                                              rounded-full flex items-center justify-center">
                                    <span className="text-green-600 dark:text-green-400 text-lg">🔒</span>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Secure & encrypted
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 
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

                {/* Links Sections */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.path}
                                            className="text-sm text-slate-600 dark:text-slate-400 
                                                     hover:text-orange-500 dark:hover:text-orange-400
                                                     transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Download Apps Section */}
                <div className="py-8 border-y border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                Get the FoodDash app
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Order faster and track your delivery in real-time
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-slate-800 
                                             text-white rounded-xl hover:bg-slate-800 
                                             dark:hover:bg-slate-700 transition-colors
                                             border border-slate-700">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.6 12.3c-.1-2.4 1.9-3.6 2-3.7-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.9.9-3.6.9-.7 0-1.9-.9-3.1-.9-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.4 1.2 0 1.7-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.2-2.6 1.3-2.7-.2-.1-2.5-1-2.5-3.7zM14.9 4.6c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.1 1.9-1 3 .9.1 1.9-.5 2.9-1.4z"/>
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs">Download on the</div>
                                    <div className="text-sm font-semibold">App Store</div>
                                </div>
                            </button>
                            <button className="flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-slate-800 
                                             text-white rounded-xl hover:bg-slate-800 
                                             dark:hover:bg-slate-700 transition-colors
                                             border border-slate-700">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 18l8.5-6L6 6v12zM18 6h-2v12h2V6z"/>
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs">Get it on</div>
                                    <div className="text-sm font-semibold">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <div className="text-sm text-slate-600 dark:text-slate-400 text-center md:text-left">
                        © {currentYear} FoodDash. All rights reserved. 
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
                                className="text-slate-400 hover:text-orange-500 
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