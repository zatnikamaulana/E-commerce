'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    CreditCard,
    Users,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
        },
        {
            name: 'Produk',
            href: '/admin/products',
            icon: Package,
        },
        {
            name: 'Pesanan',
            href: '/admin/orders',
            icon: ShoppingCart,
        },
        {
            name: 'Pembayaran',
            href: '/admin/payments',
            icon: CreditCard,
        },
        {
            name: 'User',
            href: '/admin/users',
            icon: Users,
        },
    ];

    const handleLogout = () => {
        logout();
        router.push('/auth');
    };

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-gray-900 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-6 py-5 border-b border-gray-800">
                        <h1 className="text-xl font-bold text-white">
                            1998ACCESSORIES
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-3 text-sm font-medium rounded-lg
                                        transition-all duration-200
                                        ${active
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className="mr-3 h-5 w-5" strokeWidth={1.5} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="flex-shrink-0 px-4 py-6 border-t border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200"
                        >
                            <LogOut className="mr-3 h-5 w-5" strokeWidth={1.5} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar - TODO: Add mobile menu */}
        </>
    );
}
