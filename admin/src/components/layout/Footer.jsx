import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHeart,
    FiGithub,
    FiTwitter,
    FiMail,
    FiHelpCircle,
    FiShield,
    FiClock,
    FiDatabase,
    FiCpu,
    FiServer,
    FiCloud,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiChevronUp,
    FiChevronDown,
    FiInfo,
    FiExternalLink
} from 'react-icons/fi';

interface FooterProps {
    variant?: 'default' | 'admin' | 'minimal' | 'compact';
    showVersion?: boolean;
    showStatus?: boolean;
    showLinks?: boolean;
    showSocial?: boolean;
    showSystemInfo?: boolean;
    companyName?: string;
    year?: number;
    version?: string;
    buildNumber?: string;
    environment?: 'development' | 'staging' | 'production';
    links?: Array<{
        label: string;
        href: string;
        external?: boolean;
    }>;
    socialLinks?: Array<{
        icon: React.ReactNode;
        href: string;
        label: string;
    }>;
    onLinkClick?: (link: string) => void;
    className?: string;
}

const Footer: React.FC<FooterProps> = ({
    variant = 'default',
    showVersion = true,
    showStatus = true,
    showLinks = true,
    showSocial = true,
    showSystemInfo = false,
    companyName = 'FoodieHub',
    year = new Date().getFullYear(),
    version = '1.0.0',
    buildNumber = '2024.001',
    environment = 'production',
    links = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Support', href: '/support' },
        { label: 'Documentation', href: '/docs', external: true }
    ],
    socialLinks = [
        { icon: <FiGithub />, href: 'https://github.com/foodiehub', label: 'GitHub' },
        { icon: <FiTwitter />, href: 'https://twitter.com/foodiehub', label: 'Twitter' },
        { icon: <FiMail />, href: 'mailto:support@foodiehub.com', label: 'Email' }
    ],
    onLinkClick,
    className = ''
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');
    const [serverTime, setServerTime] = useState(new Date());
    const [metrics, setMetrics] = useState({
        uptime: '99.9%',
        responseTime: '245ms',
        activeUsers: 1234,
        requestsPerMin: 5678
    });

    // Update server time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setServerTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulate status check
    useEffect(() => {
        const checkStatus = () => {
            // This would be replaced with actual API health check
            const random = Math.random();
            if (random > 0.95) {
                setSystemStatus('degraded');
            } else if (random > 0.98) {
                setSystemStatus('down');
            } else {
                setSystemStatus('healthy');
            }
        };

        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Get status color and icon
    const getStatusConfig = () => {
        switch (systemStatus) {
            case 'healthy':
                return {
                    color: 'text-green-500',
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    icon: <FiCheckCircle className="w-3 h-3" />,
                    label: 'All Systems Operational'
                };
            case 'degraded':
                return {
                    color: 'text-yellow-500',
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    icon: <FiAlertCircle className="w-3 h-3" />,
                    label: 'Degraded Performance'
                };
            case 'down':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    icon: <FiXCircle className="w-3 h-3" />,
                    label: 'System Outage'
                };
        }
    };

    const statusConfig = getStatusConfig();

    // Variant classes
    const variantClasses = {
        default: 'bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700',
        admin: 'bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800',
        minimal: 'bg-transparent border-t border-slate-100 dark:border-slate-800',
        compact: 'bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-2'
    };

    // Environment badge colors
    const envColors = {
        development: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        staging: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        production: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };

    return (
        <footer className={`
            ${variantClasses[variant]}
            px-4 sm:px-6 lg:px-8
            transition-all duration-200
            ${className}
        `}>
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className={`
                    flex flex-col sm:flex-row items-center justify-between
                    ${variant === 'compact' ? 'py-2' : 'py-4'}
                `}>
                    {/* Copyright Section */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <p>
                            © {year} {companyName}. All rights reserved.
                        </p>
                        
                        {/* Made with love indicator */}
                        <span className="hidden sm:flex items-center gap-1 ml-2">
                            Made with
                            <FiHeart className="w-3 h-3 text-red-500 animate-pulse" />
                            for food lovers
                        </span>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        {/* Environment Badge */}
                        {environment !== 'production' && (
                            <span className={`
                                px-2 py-0.5 rounded-full text-[10px] font-medium uppercase
                                ${envColors[environment]}
                            `}>
                                {environment}
                            </span>
                        )}

                        {/* Version Info */}
                        {showVersion && (
                            <div className="relative group">
                                <span className="px-2 py-0.5 rounded-full
                                               bg-slate-100 dark:bg-slate-700
                                               text-slate-600 dark:text-slate-400
                                               text-[10px] font-medium cursor-help
                                               flex items-center gap-1">
                                    <FiInfo className="w-3 h-3" />
                                    v{version}
                                </span>
                                
                                {/* Version Tooltip */}
                                <div className="absolute bottom-full right-0 mb-2 hidden
                                              group-hover:block z-10">
                                    <div className="bg-white dark:bg-slate-800
                                                  rounded-lg shadow-lg
                                                  border border-slate-200 dark:border-slate-700
                                                  p-2 text-xs whitespace-nowrap">
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Build: {buildNumber}
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Released: {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System Status */}
                        {showStatus && (
                            <div className="relative group">
                                <div className={`
                                    flex items-center gap-1.5 px-2 py-0.5 rounded-full
                                    ${statusConfig.bg} ${statusConfig.color}
                                    text-[10px] font-medium cursor-help
                                `}>
                                    {statusConfig.icon}
                                    <span className="hidden sm:inline">Status</span>
                                </div>

                                {/* Status Tooltip */}
                                <div className="absolute bottom-full right-0 mb-2 hidden
                                              group-hover:block z-10">
                                    <div className="bg-white dark:bg-slate-800
                                                  rounded-lg shadow-lg
                                                  border border-slate-200 dark:border-slate-700
                                                  p-3 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`
                                                w-2 h-2 rounded-full
                                                ${systemStatus === 'healthy' && 'bg-green-500'}
                                                ${systemStatus === 'degraded' && 'bg-yellow-500'}
                                                ${systemStatus === 'down' && 'bg-red-500'}
                                            `} />
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Last checked: {serverTime.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        {showLinks && links.length > 0 && (
                            <div className="flex items-center gap-3">
                                {links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onLinkClick?.(link.label);
                                        }}
                                        target={link.external ? '_blank' : undefined}
                                        rel={link.external ? 'noopener noreferrer' : undefined}
                                        className="text-xs text-slate-600 dark:text-slate-400
                                                 hover:text-orange-500 dark:hover:text-orange-400
                                                 transition-colors flex items-center gap-1"
                                    >
                                        {link.label}
                                        {link.external && (
                                            <FiExternalLink className="w-3 h-3" />
                                        )}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Social Links */}
                        {showSocial && socialLinks.length > 0 && (
                            <div className="flex items-center gap-2">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-slate-500 hover:text-orange-500
                                                 hover:bg-slate-100 dark:hover:bg-slate-700
                                                 rounded-lg transition-all duration-200"
                                        aria-label={social.label}
                                    >
                                        {React.cloneElement(social.icon as React.ReactElement, {
                                            className: 'w-4 h-4'
                                        })}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Expand/Collapse Button (for system info) */}
                        {showSystemInfo && (
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="p-1.5 text-slate-500 hover:text-orange-500
                                         hover:bg-slate-100 dark:hover:bg-slate-700
                                         rounded-lg transition-all duration-200
                                         sm:hidden"
                            >
                                {showDetails ? (
                                    <FiChevronDown className="w-4 h-4" />
                                ) : (
                                    <FiChevronUp className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* System Information (Collapsible) */}
                {showSystemInfo && (
                    <>
                        {/* Desktop view - always visible */}
                        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 py-4
                                      border-t border-slate-200 dark:border-slate-700
                                      text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <FiClock className="w-4 h-4 text-orange-500" />
                                <span>Server Time: {serverTime.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCpu className="w-4 h-4 text-orange-500" />
                                <span>Uptime: {metrics.uptime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiDatabase className="w-4 h-4 text-orange-500" />
                                <span>Response: {metrics.responseTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiServer className="w-4 h-4 text-orange-500" />
                                <span>Active Users: {metrics.activeUsers}</span>
                            </div>
                        </div>

                        {/* Mobile view - collapsible */}
                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="sm:hidden overflow-hidden"
                                >
                                    <div className="py-4 space-y-2 border-t border-slate-200
                                                  dark:border-slate-700">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Server Time:</span>
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {serverTime.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Uptime:</span>
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {metrics.uptime}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Response Time:</span>
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {metrics.responseTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Active Users:</span>
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {metrics.activeUsers}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Live Stats Bar (Optional) */}
                {variant === 'admin' && (
                    <div className="py-2 border-t border-slate-200 dark:border-slate-700
                                  flex flex-wrap items-center justify-between gap-4
                                  text-[10px] text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <FiCloud className="w-3 h-3" />
                                API: <span className="text-green-500">200</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <FiDatabase className="w-3 h-3" />
                                DB: <span className="text-green-500">Connected</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <FiLoader className="w-3 h-3 animate-spin" />
                                Queue: 0
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Requests/min: {metrics.requestsPerMin}</span>
                            <span>•</span>
                            <span>Cache: 98% hit</span>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;