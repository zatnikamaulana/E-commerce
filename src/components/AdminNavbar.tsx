'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Package } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminNavbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/admin-new" className="flex items-center space-x-2">
                        <Package className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                        <span className="text-xl font-semibold tracking-tight text-gray-900">
                            1998ACCESSORIES Admin
                        </span>
                    </Link>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-6">
                        {user && (
                            <div className="text-sm text-gray-600">
                                <span className="font-medium text-gray-900">{user.name}</span>
                                <span className="ml-2 text-gray-400">({user.role})</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={1.5} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
