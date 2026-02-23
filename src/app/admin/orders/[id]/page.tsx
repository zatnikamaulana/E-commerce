'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { ArrowLeft, User, MapPin, Phone, Mail, Package, Save } from 'lucide-react';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        imageUrl: string;
    };
}

interface Order {
    id: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    paymentMethod: string;
    totalPrice: number;
    status: string;
    trackingNumber?: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    items: OrderItem[];
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.admin.getById(orderId);

            if (response.success && response.data) {
                setOrder(response.data.order);
                setStatus(response.data.order.status);
                setTrackingNumber(response.data.order.trackingNumber || '');
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!order) return;

        try {
            setSaving(true);
            const response = await ordersAPI.admin.updateStatus(orderId, {
                status,
                trackingNumber: status === 'SHIPPED' ? trackingNumber : undefined,
            });

            if (response.success) {
                alert('Status pesanan berhasil diperbarui!');
                fetchOrder();
            } else {
                alert('Gagal memperbarui status: ' + response.error);
            }
        } catch (error) {
            console.error('Failed to update order:', error);
            alert('Terjadi kesalahan saat memperbarui status');
        } finally {
            setSaving(false);
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
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Memuat data...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Pesanan tidak ditemukan</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/orders')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
                    <p className="text-sm text-gray-600 mt-1">ID: {order.id}</p>
                </div>
                {getStatusBadge(order.status)}
            </div>

            {/* 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Customer Info */}
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Informasi Pembeli
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-500">Nama Lengkap</label>
                                <p className="text-gray-900 font-medium">{order.customerName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Email</label>
                                <p className="text-gray-900">{order.user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Telepon</label>
                                <p className="text-gray-900">{order.customerPhone}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Metode Pembayaran</label>
                                <p className="text-gray-900 capitalize">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Tanggal Pesanan</label>
                                <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Alamat Pengiriman
                        </h2>
                        <p className="text-gray-900 leading-relaxed">{order.customerAddress}</p>
                    </div>
                </div>

                {/* Right Column: Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Produk yang Dibeli
                    </h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                                <img
                                    src={item.product.imageUrl || '/placeholder.png'}
                                    alt={item.product.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatPrice(item.price)} x {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        Subtotal: {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="pt-4 border-t-2 border-gray-300">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Total Pembayaran</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Status Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status Pesanan</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Pesanan
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Dibayar</option>
                            <option value="SHIPPED">Dikirim</option>
                            <option value="DELIVERED">Selesai</option>
                            <option value="CANCELLED">Dibatalkan</option>
                        </select>
                    </div>

                    {status === 'SHIPPED' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nomor Resi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Masukkan nomor resi pengiriman"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || (status === 'SHIPPED' && !trackingNumber)}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
