'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersAPI } from '@/lib/api';
import { ArrowLeft, User, Mail, Calendar, ShoppingBag, Package } from 'lucide-react';

interface Order {
    id: string;
    totalPrice: number;
    status: string;
    customerName: string;
    createdAt: string;
    items: {
        quantity: number;
        product: {
            name: string;
        };
    }[];
}

interface UserDetail {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    orders: Order[];
}

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.getById(userId);

            if (response.success && response.data) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            PAID: 'bg-blue-100 text-blue-800 border-blue-200',
            SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
            DELIVERED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
        };

        const labels: Record<string, string> = {
            PENDING: 'Pending',
            PAID: 'Dibayar',
            SHIPPED: 'Dikirim',
            DELIVERED: 'Selesai',
            CANCELLED: 'Dibatalkan',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        if (role === 'ADMIN') {
            return (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    Admin
                </span>
            );
        }
        return (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                User
            </span>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTotalSpent = () => {
        if (!user) return 0;
        return user.orders
            .filter(order => order.status !== 'CANCELLED')
            .reduce((sum, order) => sum + order.totalPrice, 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Memuat data...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">User tidak ditemukan</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Detail User</h1>
                    <p className="text-sm text-gray-600 mt-1">Informasi lengkap dan riwayat pesanan</p>
                </div>
                {getRoleBadge(user.role)}
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi User
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nama Lengkap
                        </label>
                        <p className="text-gray-900 font-medium mt-1">{user.name}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                        </label>
                        <p className="text-gray-900 mt-1">{user.email}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Terdaftar Sejak
                        </label>
                        <p className="text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Total Pesanan
                        </label>
                        <p className="text-gray-900 font-medium mt-1">{user.orders.length} pesanan</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-500">Total Belanja</label>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {formatPrice(getTotalSpent())}
                        </p>
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Riwayat Pesanan ({user.orders.length})
                </h2>

                {user.orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Belum ada pesanan
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {user.orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900">
                                                {order.id.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx}>
                                                        {item.product.name} (x{item.quantity})
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(order.totalPrice)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {formatDateTime(order.createdAt)}
                                            </div>
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
