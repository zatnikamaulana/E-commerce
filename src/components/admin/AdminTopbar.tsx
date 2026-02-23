'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { User } from 'lucide-react';

export default function AdminTopbar() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Get page title based on pathname
    const getPageTitle = () => {
        if (pathname === '/admin') return 'Dashboard';
        if (pathname.startsWith('/admin/products')) return 'Manajemen Produk';
        if (pathname.startsWith('/admin/orders')) return 'Manajemen Pesanan';
        if (pathname.startsWith('/admin/payments')) return 'Manajemen Pembayaran';
        if (pathname.startsWith('/admin/users')) return 'Manajemen User';
        return 'Admin Panel';
    };

    return (
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Page Title */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {getPageTitle()}
                    </h2>
                </div>

                {/* Admin Profile */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                            {user?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user?.email || ''}
                        </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-900 rounded-full">
                        <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
