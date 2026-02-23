'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Menu, X, LogOut, Package } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { state } = useCart();
    const { user, isAdmin, logout, isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartBounce, setCartBounce] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        ...(isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
    ];

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (state.items.length > 0) {
            setCartBounce(true);
            const timer = setTimeout(() => setCartBounce(false), 500);
            return () => clearTimeout(timer);
        }
    }, [state.items.length]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        router.push('/');
    };

    return (
        <nav
            className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-100'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <span className="text-xl font-semibold tracking-tight text-gray-900 transition-all duration-300 group-hover:scale-105">
                            1998ACCESSORIES
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-all duration-300 relative underline-animate ${isActive(item.href)
                                    ? 'text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-6">
                        {/* Cart */}
                        <Link href="/cart" className="relative group">
                            <ShoppingBag
                                className={`w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-all duration-300 ${cartBounce ? 'animate-bounce-slow' : ''
                                    }`}
                                strokeWidth={1.5}
                            />
                            {state.items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-pulse">
                                    {state.items.length}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="group flex items-center space-x-2"
                                >
                                    <User
                                        className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-all duration-300 group-hover:scale-110"
                                        strokeWidth={1.5}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="w-4 h-4" strokeWidth={1.5} />
                                            <span>Profil Saya</span>
                                        </Link>
                                        <Link
                                            href="/orders"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Package className="w-4 h-4" strokeWidth={1.5} />
                                            <span>Pesanan Saya</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" strokeWidth={1.5} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth" className="group">
                                <User
                                    className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-all duration-300 group-hover:scale-110"
                                    strokeWidth={1.5}
                                />
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden transition-transform duration-300 hover:scale-110"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white fade-in">
                    <div className="px-4 py-4 space-y-3">
                        {navigation.map((item, index) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block text-sm font-medium py-2 transition-all duration-300 hover:translate-x-2 fade-in-up stagger-${index + 1
                                    } ${isActive(item.href) ? 'text-gray-900' : 'text-gray-600'}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {user && (
                            <div className="pt-3 border-t border-gray-100 fade-in-up stagger-4">
                                <p className="text-sm text-gray-600">{user.name}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
