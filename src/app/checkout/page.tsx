'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { ordersAPI, authAPI } from '@/lib/api';
import { MapPin, Edit } from 'lucide-react';

interface UserAddress {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
    address: string;
}

export default function CheckoutPage() {
    const { state, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userAddress, setUserAddress] = useState<UserAddress | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cod'>('transfer');

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }
        loadUserAddress();
    }, [isAuthenticated, router]);

    const loadUserAddress = async () => {
        try {
            const response = await authAPI.getMe();
            if (response.success && response.data) {
                const userData = response.data.user;

                // Check if address is complete
                if (!userData.phone || !userData.province || !userData.city ||
                    !userData.district || !userData.postalCode || !userData.address) {
                    // Address incomplete, redirect to profile
                    alert('Silakan lengkapi alamat pengiriman Anda terlebih dahulu.');
                    router.push('/profile');
                    return;
                }

                setUserAddress({
                    name: userData.name,
                    phone: userData.phone,
                    province: userData.province,
                    city: userData.city,
                    district: userData.district,
                    postalCode: userData.postalCode,
                    address: userData.address
                });
            }
        } catch (error) {
            console.error('Error loading user address:', error);
            setError('Gagal memuat alamat. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isAuthenticated || !user) {
            setError('Anda harus login terlebih dahulu');
            router.push('/auth');
            return;
        }

        if (state.items.length === 0) {
            setError('Keranjang kosong');
            return;
        }

        if (!userAddress) {
            setError('Alamat belum lengkap');
            router.push('/profile');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare items data from cart
            const items = state.items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            }));

            console.log('🛒 Checkout with items:', items);

            // Create order via API (address will be taken from user profile in backend)
            const response = await ordersAPI.create({
                paymentMethod: paymentMethod.toUpperCase(),
                items: items
            });

            console.log('✅ Order response:', response);

            if (response.success && response.data) {
                // Clear cart
                clearCart();

                // Show success message
                alert('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');

                // Redirect to order detail
                router.push(`/orders/${response.data.order.id}`);
            } else {
                // Check if address incomplete error
                if (response.error?.includes('Alamat belum lengkap')) {
                    alert('Alamat belum lengkap. Silakan lengkapi profil Anda.');
                    router.push('/profile');
                } else {
                    setError(response.error || 'Gagal membuat pesanan');
                }
            }
        } catch (err) {
            console.error('❌ Checkout error:', err);
            setError('Terjadi kesalahan. Pastikan backend berjalan di http://localhost:5000');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        );
    }

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🛒</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Kosong</h1>
                    <p className="text-gray-600 mb-6">Tidak ada produk untuk di-checkout.</p>
                    <Button onClick={() => router.push('/products')}>
                        Mulai Belanja
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Checkout</h1>
                    <p className="text-gray-600">Lengkapi informasi untuk menyelesaikan pesanan</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" strokeWidth={1.5} />
                                    Alamat Pengiriman
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => router.push('/profile')}
                                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                    Ubah Alamat
                                </button>
                            </div>

                            {userAddress ? (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="font-semibold text-gray-900 mb-2">{userAddress.name}</p>
                                    <p className="text-sm text-gray-700 mb-1">{userAddress.phone}</p>
                                    <p className="text-sm text-gray-700">
                                        {userAddress.address}, {userAddress.district}, {userAddress.city}, {userAddress.province} {userAddress.postalCode}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 text-sm">
                                        Alamat belum lengkap. Silakan lengkapi di halaman profil.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/profile')}
                                        className="mt-2 text-sm text-yellow-900 font-medium hover:underline"
                                    >
                                        Lengkapi Alamat →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6">Metode Pembayaran</h2>

                            <div className="space-y-4">
                                {/* Transfer Bank */}
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'transfer'
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="transfer"
                                        checked={paymentMethod === 'transfer'}
                                        onChange={(e) => setPaymentMethod(e.target.value as 'transfer' | 'cod')}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Transfer Bank</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Transfer ke rekening bank kami
                                        </p>
                                        {paymentMethod === 'transfer' && (
                                            <div className="mt-3 bg-white rounded p-3 text-sm border border-gray-200">
                                                <p className="font-medium text-gray-900">Bank BCA</p>
                                                <p className="text-gray-700">No. Rek: 1234567890</p>
                                                <p className="text-gray-700">a.n. 1998ACCESSORIES</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Upload bukti transfer setelah pembayaran
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {/* COD */}
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod'
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value as 'transfer' | 'cod')}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">COD (Bayar di Tempat)</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Bayar saat barang diterima
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !userAddress}
                                >
                                    {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
                                </Button>
                                {!userAddress && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Lengkapi alamat terlebih dahulu untuk melanjutkan
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>

                            {/* Order Items */}
                            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                {state.items.map((item) => (
                                    <div key={item.product.id} className="flex items-center space-x-3">
                                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {item.product.image && typeof item.product.image === 'string' && item.product.image.trim().length > 0 ? (
                                                <Image
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-xl">📷</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity}x {formatPrice(item.product.price)}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-800">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal ({state.items.length} item)</span>
                                    <span className="font-medium">{formatPrice(state.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Ongkos Kirim</span>
                                    <span className="font-medium text-green-600">Gratis</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold">Total</span>
                                        <span className="text-lg font-bold text-gray-900">{formatPrice(state.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
