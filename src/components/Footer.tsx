import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import CountrySelector, { useCountry, Country } from './CountrySelector';
import SocialLinks from './SocialLinks';
import { ShieldCheck, Lock } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

interface FooterProps {
    selectedCountry?: Country
    onCountryChange?: (country: Country) => void
}

const Footer = ({ selectedCountry, onCountryChange }: FooterProps) => {
    const { t } = useLanguage();
    // Use hook as fallback if props are not provided (e.g. used standalone)
    const { selectedCountry: hookCountry, updateCountry: hookUpdate } = useCountry();

    const activeCountry = selectedCountry || hookCountry;
    const handleCountryChange = onCountryChange || hookUpdate;

    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-xl">
                                <ShieldCheck className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                FinleyBook
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Empowering your financial journey with AI-driven insights and smart budgeting tools.
                        </p>
                        <p className="text-gray-400 text-sm">
                            Copyright © 2025 FinleyBook Inc. <br />All rights reserved.
                        </p>

                        {/* Universal Trust Signals */}
                        <div className="flex flex-col gap-2 pt-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Lock className="w-3 h-3 text-green-600" />
                                <span>256-bit SSL Encrypted</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                                <span>Bank-level Security</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-6">Product</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/#features" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/#how-it-works" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    How it Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/#testimonials" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    Testimonials
                                </Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-6">Company</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    {t('nav.privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    {t('nav.terms')}
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:support@finleybook.com" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm">
                                    Contact Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-6">Stay Connected</h3>
                        <div className="space-y-6">
                            {/* Global Growth Engine - Newsletter */}
                            <NewsletterForm />

                            <SocialLinks />
                            <div className="pt-2">
                                <CountrySelector
                                    selectedCountry={activeCountry}
                                    onCountryChange={handleCountryChange}
                                    className=""
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Affiliate Disclosure */}
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <p className="text-gray-400 text-xs text-center max-w-3xl mx-auto leading-relaxed">
                        FinleyBook may earn a commission from qualifying purchases made through affiliate links on our platform at no extra cost to you.
                        We only recommend products and services we trust and believe will add value to our users.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
