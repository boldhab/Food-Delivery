import React from 'react';

const Footer = () => {
    return (
        <footer className="px-6 py-4 mt-auto border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-[13px] text-[var(--text-secondary)] font-medium">
            <p>(c) 2026 FoodieHub Admin Panel.</p>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <span className="px-2 py-0.5 rounded bg-[rgba(74,144,226,0.12)] text-[var(--primary)] text-[11px] uppercase tracking-wider font-bold">Version 1.0.0</span>
                <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[var(--primary)] transition-colors">Support</a>
            </div>
        </footer>
    );
};

export default Footer;
