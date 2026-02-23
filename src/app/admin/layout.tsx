'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Check authentication and admin role
        if (!isLoading) {
            if (!user) {
                // Not logged in, redirect to auth
                router.push('/auth');
            } else if (user.role !== 'ADMIN') {
                // Not admin, redirect to home
                router.push('/');
            }
        }
    }, [user, isLoading, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated or not admin
    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar - Fixed Left */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="lg:pl-64">
                {/* Topbar - Fixed Top */}
                <AdminTopbar />

                {/* Page Content */}
                <main className="pt-16 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
