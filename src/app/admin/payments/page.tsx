'use client';

import React, { useEffect, useState } from 'react';
import { paymentsAPI } from '@/lib/api';
import { Search, CreditCard, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Payment {
    id: string;
    orderId: string;
    paymentMethod: string;
    proofUrl: string | null;
    status: string;
    createdAt: string;
    order: {
        customerName: string;
        totalPrice: number;
        user: {
            name: string;
            email: string;
        };
    };
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, [statusFilter]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await paymentsAPI.getAll({
                search,
                status: statusFilter || undefined
            });

            if (response.success && response.data) {
                setPayments(response.data.payments);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPayments();
    };

    const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
        try {
            setUpdating(true);
            const response = await paymentsAPI.updateStatus(paymentId, { status: newStatus });

            if (response.success) {
                alert('Status pembayaran berhasil diperbarui!');
                setShowModal(false);
                setSelectedPayment(null);
                fetchPayments();
            } else {
                alert('Gagal memperbarui status: ' + response.error);
            }
        } catch (error) {
            console.error('Failed to update payment:', error);
            alert('Terjadi kesalahan saat memperbarui status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; text: string; icon: any }> = {
            MENUNGGU: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: Clock
            },
            DITERIMA: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: CheckCircle
            },
            DITOLAK: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: XCircle
            },
        };

        const config = styles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {status}
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
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
                    <p className="text-sm text-gray-600 mt-1">Kelola konfirmasi pembayaran pelanggan</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">{payments.length} Pembayaran</span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari order ID atau metode pembayaran..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            />
                        </div>
                    </form>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="MENUNGGU">Menunggu</option>
                        <option value="DITERIMA">Diterima</option>
                        <option value="DITOLAK">Ditolak</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Memuat data...
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Tidak ada pembayaran ditemukan
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
                                        Pelanggan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Metode
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bukti
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
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900">
                                                {payment.orderId.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {payment.order.customerName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {payment.order.user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 capitalize">
                                                {payment.paymentMethod}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(payment.order.totalPrice)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {payment.proofUrl ? (
                                                <a
                                                    href={payment.proofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    Lihat Bukti
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {formatDate(payment.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setShowModal(true);
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Aksi
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Update Status */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Update Status Pembayaran
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600">Order ID</label>
                                <p className="font-mono text-sm">{selectedPayment.orderId}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Pelanggan</label>
                                <p className="font-medium">{selectedPayment.order.customerName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Total</label>
                                <p className="font-medium">{formatPrice(selectedPayment.order.totalPrice)}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Status Saat Ini</label>
                                <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                            </div>

                            {selectedPayment.status === 'MENUNGGU' && (
                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedPayment.id, 'DITERIMA')}
                                        disabled={updating}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4 inline mr-2" />
                                        Terima
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedPayment.id, 'DITOLAK')}
                                        disabled={updating}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4 inline mr-2" />
                                        Tolak
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedPayment(null);
                                }}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
