'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersAPI, paymentsAPI } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle, Upload, Image as ImageIcon } from 'lucide-react';

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

interface Payment {
    id: string;
    status: string;
    paymentMethod: string;
    proofUrl?: string;
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
    items: OrderItem[];
    payment?: Payment;
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { isAuthenticated } = useAuth();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, isAuthenticated]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getById(orderId);

            if (response.success && response.data) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadProof = async () => {
        if (!selectedFile || !order) return;

        try {
            setUploading(true);
            const response = await paymentsAPI.uploadProof(order.id, selectedFile);

            if (response.success) {
                alert('Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.');
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchOrder();
            } else {
                alert('Gagal upload bukti: ' + response.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Terjadi kesalahan saat upload');
        } finally {
            setUploading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        const configs: Record<string, { label: string; color: string; icon: any }> = {
            PENDING: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            PAID: { label: 'Diproses', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
            SHIPPED: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
            DELIVERED: { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        };
        return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    };

    const getPaymentStatusInfo = (status: string) => {
        const configs: Record<string, { label: string; color: string }> = {
            MENUNGGU: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-800' },
            DITERIMA: { label: 'Pembayaran Diterima', color: 'bg-green-100 text-green-800' },
            DITOLAK: { label: 'Pembayaran Ditolak', color: 'bg-red-100 text-red-800' },
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Memuat data pesanan...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Pesanan tidak ditemukan</p>
                    <button
                        onClick={() => router.push('/orders')}
                        className="text-gray-900 hover:underline"
                    >
                        Kembali ke Riwayat Pesanan
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const showUploadForm = order.payment && (order.payment.status === 'MENUNGGU' || order.payment.status === 'DITOLAK') && order.payment.paymentMethod === 'TRANSFER';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/orders')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Riwayat Pesanan
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
                            <p className="text-sm text-gray-600 mt-1">Order ID: {order.id}</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color}`}>
                            <StatusIcon className="w-5 h-5" />
                            <span className="font-medium">{statusInfo.label}</span>
                        </div>
                    </div>
                </div>

                {order.payment && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Status Pembayaran
                        </h2>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Metode: {order.payment.paymentMethod}</p>
                                <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(order.createdAt)}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusInfo(order.payment.status).color}`}>
                                {getPaymentStatusInfo(order.payment.status).label}
                            </div>
                        </div>

                        {order.payment.paymentMethod === 'TRANSFER' && order.payment.status !== 'DITERIMA' && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                <p className="text-sm font-medium text-blue-900 mb-2">Informasi Transfer:</p>
                                <div className="text-sm text-blue-800">
                                    <p>Bank BCA</p>
                                    <p>No. Rek: 1234567890</p>
                                    <p>a.n. 1998ACCESSORIES</p>
                                    <p className="mt-2 font-medium">Total: {formatPrice(order.totalPrice)}</p>
                                </div>
                            </div>
                        )}

                        {showUploadForm && (
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-medium text-gray-900 mb-3">
                                    {order.payment.status === 'DITOLAK' ? 'Upload Ulang Bukti Transfer' : 'Upload Bukti Transfer'}
                                </h3>

                                {order.payment.status === 'DITOLAK' && (
                                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-800">
                                            Pembayaran Anda ditolak. Silakan upload bukti transfer yang valid.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pilih Gambar Bukti Transfer
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                        />
                                    </div>

                                    {previewUrl && (
                                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUploadProof}
                                        disabled={!selectedFile || uploading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Upload className="w-5 h-5" />
                                        {uploading ? 'Mengupload...' : 'Upload Bukti'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {order.payment.proofUrl && order.payment.status === 'MENUNGGU' && (
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-medium text-gray-900 mb-3">Bukti Transfer yang Diupload</h3>
                                <a
                                    href={order.payment.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                    Lihat Bukti Transfer
                                </a>
                                <p className="text-sm text-gray-600 mt-2">
                                    Menunggu verifikasi dari admin
                                </p>
                            </div>
                        )}

                        {order.payment.status === 'DITERIMA' && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Pembayaran telah dikonfirmasi</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Informasi Pengiriman
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Nama Penerima</p>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Alamat</p>
                            <p className="text-gray-900">{order.customerAddress}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Nomor Telepon</p>
                            <p className="text-gray-900">{order.customerPhone}</p>
                        </div>
                        {order.trackingNumber && (
                            <div>
                                <p className="text-sm text-gray-600">Nomor Resi</p>
                                <p className="font-mono font-medium text-gray-900">{order.trackingNumber}</p>
                            </div>
                        )}
                    </div>
                </div>

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
        </div>
    );
}
