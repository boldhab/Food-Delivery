import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="px-6 py-4 mt-auto border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-[13px] text-slate-500 font-medium">
            <p>© 2024 FoodieHub Admin Panel. Built with passion.</p>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px] uppercase tracking-wider font-bold">Version 1.0.0</span>
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
        </footer>
    );
};

export default Footer;
