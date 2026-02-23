'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Package, Eye, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

interface Order {
    id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    payment?: {
        status: string;
    };
}

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }

        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll();

            if (response.success && response.data) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getOrderStatusInfo = (status: string) => {
        const configs: Record<string, { label: string; color: string; icon: any }> = {
            PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            PAID: { label: 'Diproses', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
            SHIPPED: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
            DELIVERED: { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        };
        return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    };

    const getPaymentStatusInfo = (status: string) => {
        const configs: Record<string, { label: string; color: string }> = {
            MENUNGGU: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
            DITERIMA: { label: 'Diterima', color: 'bg-green-100 text-green-800' },
            DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
        };
        return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
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
            month: 'short',
            year: 'numeric',
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Redirecting to login...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
                    <p className="text-gray-600 mt-2">Lihat semua pesanan yang pernah Anda buat</p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-500">Memuat data...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pesanan</h3>
                        <p className="text-gray-600 mb-6">Anda belum pernah membuat pesanan</p>
                        <button
                            onClick={() => router.push('/products')}
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status Pesanan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status Pembayaran
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => {
                                        const orderStatus = getOrderStatusInfo(order.status);
                                        const OrderIcon = orderStatus.icon;
                                        const paymentStatus = order.payment ? getPaymentStatusInfo(order.payment.status) : null;

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-mono text-gray-900">
                                                        {order.id.substring(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatPrice(order.totalPrice)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${orderStatus.color}`}>
                                                        <OrderIcon className="w-3 h-3" />
                                                        {orderStatus.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {paymentStatus ? (
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatus.color}`}>
                                                            {paymentStatus.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => router.push(`/orders/${order.id}`)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
