'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/lib/CartContext';

export default function CartPage() {
    const { state, updateQuantity, removeFromCart, clearCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🛒</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Keranjang Kosong</h1>
                    <p className="text-gray-600 mb-6">Belum ada produk di keranjang Anda.</p>
                    <Link href="/products">
                        <Button>Mulai Belanja</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Keranjang Belanja</h1>
                    <p className="text-gray-600">Kelola produk yang akan Anda beli</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Produk ({state.items.length})
                                    </h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                    >
                                        Hapus Semua
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {state.items.map((item) => (
                                    <div key={item.product.id} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            {/* Product Image */}
                                            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product.image && typeof item.product.image === 'string' && item.product.image.trim().length > 0 ? (
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-3xl">📷</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/product/${item.product.id}`}>
                                                    <h3 className="text-lg font-medium text-gray-800 hover:text-gray-900 transition-colors">
                                                        {item.product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.product.category.charAt(0).toUpperCase() + item.product.category.slice(1)}
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                                    {formatPrice(item.product.price)}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                    disabled={item.quantity >= item.product.stock}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-gray-600 hover:text-gray-900 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="mt-4 text-right">
                                            <span className="text-sm text-gray-500">Subtotal: </span>
                                            <span className="font-semibold text-gray-800">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatPrice(state.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ongkos Kirim</span>
                                    <span className="font-medium">Gratis</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-semibold">Total</span>
                                        <span className="text-lg font-bold text-gray-900">{formatPrice(state.total)}</span>
                                    </div>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <Button className="w-full mb-4">
                                    Lanjut ke Checkout
                                </Button>
                            </Link>

                            <Link href="/products">
                                <Button variant="outline" className="w-full">
                                    Lanjut Belanja
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}