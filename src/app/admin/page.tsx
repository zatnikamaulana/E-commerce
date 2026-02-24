'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    pendingPayments: number;
    lowStockProducts: number;
}

interface RecentOrder {
    id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    items: any[];
    payment: {
        status: string;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { isAdmin, isAuthenticated } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) {
            router.push('/auth');
            return;
        }

        fetchDashboardData();
    }, [isAuthenticated, isAdmin, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getStats();

            if (response.success && response.data) {
                setStats(response.data.stats);
                setRecentOrders(response.data.recentOrders);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PAID': 'bg-blue-100 text-blue-800',
            'SHIPPED': 'bg-purple-100 text-purple-800',
            'DELIVERED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
        );
    }

    const statsCards = [
        {
            name: 'Total Produk',
            value: stats?.totalProducts || 0,
            icon: Package,
            color: 'bg-blue-500',
            link: '/admin/products'
        },
        {
            name: 'Total Pesanan',
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: 'bg-green-500',
            link: '/admin/orders'
        },
        {
            name: 'Total User',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'bg-purple-500',
            link: '/admin/users'
        },
        {
            name: 'Total Pendapatan',
            value: formatPrice(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: 'bg-yellow-500',
            link: '/admin/orders'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <button
                            key={stat.name}
                            onClick={() => router.push(stat.link)}
                            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all hover:scale-105 text-left"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {stat.name}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Alerts */}
            {(stats?.pendingPayments || 0) > 0 || (stats?.lowStockProducts || 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(stats?.pendingPayments || 0) > 0 && (
                        <button
                            onClick={() => router.push('/admin/payments')}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-900">
                                        {stats?.pendingPayments || 0} Pembayaran Menunggu Verifikasi
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        Klik untuk verifikasi pembayaran
                                    </p>
                                </div>
                            </div>
                        </button>
                    )}

                    {(stats?.lowStockProducts || 0) > 0 && (
                        <button
                            onClick={() => router.push('/admin/products')}
                            className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <Package className="w-5 h-5 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-900">
                                        {stats?.lowStockProducts || 0} Produk Stock Rendah
                                    </p>
                                    <p className="text-sm text-red-700">
                                        Stock kurang dari 10 unit
                                    </p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            ) : null}

            {/* Recent Orders Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Pesanan Terbaru
                    </h3>
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Lihat Semua →
                    </button>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada pesanan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.customerName}</div>
                                            <div className="text-sm text-gray-500">{order.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.items?.length || 0} item
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatPrice(order.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                Detail →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
