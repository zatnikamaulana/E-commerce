'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Button from '@/components/Button';
import ImageSlider from '@/components/ImageSlider';
import { useCart } from '@/lib/CartContext';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (params.id) {
            loadProduct(params.id as string);
        }
    }, [params.id]);

    const loadProduct = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await productsAPI.getById(id);
            if (response.success && response.data) {
                setProduct(response.data.product);
            } else {
                setProduct(null);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setProduct(null);
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

    const handleAddToCart = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            alert(`${quantity} ${product.name} ditambahkan ke keranjang!`);
        }
    };

    const handleBuyNow = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            router.push('/cart');
        }
    };

    const incrementQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat produk...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-6xl mb-4 opacity-20">📦</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Produk tidak ditemukan</h3>
                    <p className="text-gray-600 mb-6">
                        Produk yang Anda cari tidak tersedia.
                    </p>
                    <Button onClick={() => router.push('/products')}>
                        <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={2} />
                        Kembali ke Produk
                    </Button>
                </div>
            </div>
        );
    }

    // Prepare images array for slider
    const productImages = product.images && product.images.length > 0
        ? product.images
        : product.image
            ? [product.image]
            : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
                    <span className="font-medium">Kembali</span>
                </button>

                {/* Product Detail Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side - Image Slider */}
                    <div className="fade-in-up">
                        <ImageSlider images={productImages} productName={product.name} />
                    </div>

                    {/* Right Side - Product Info */}
                    <div className="space-y-6 fade-in-up stagger-1">
                        {/* Category Badge */}
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full capitalize">
                                {product.category}
                            </span>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                            </span>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' :
                                    product.stock > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                                }`} />
                            <span className="text-sm text-gray-600">
                                {product.stock > 10 ? 'Stok tersedia' :
                                    product.stock > 0 ? `Stok terbatas (${product.stock} tersisa)` : 'Stok habis'}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200" />

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi Produk</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200" />

                        {/* Quantity Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Jumlah
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                        className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus className="w-5 h-5" strokeWidth={2} />
                                    </button>
                                    <span className="px-6 py-3 font-semibold text-gray-900 min-w-[60px] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={incrementQuantity}
                                        disabled={quantity >= product.stock}
                                        className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus className="w-5 h-5" strokeWidth={2} />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">
                                    Stok: {product.stock}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                size="lg"
                                className="w-full shadow-lg hover:shadow-xl"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" strokeWidth={2} />
                                Beli Sekarang
                            </Button>
                            <Button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                variant="outline"
                                size="lg"
                                className="w-full"
                            >
                                Tambah ke Keranjang
                            </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">Garansi produk original 100%</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                                <span className="text-gray-700">Gratis ongkir untuk pembelian di atas Rp 100.000</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                <span className="text-gray-700">Pengembalian mudah dalam 7 hari</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
