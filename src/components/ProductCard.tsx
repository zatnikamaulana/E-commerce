'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/CartContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <Link href={`/product/${product.id}`}>
            <div
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 card-hover"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container with Zoom Effect */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden image-zoom-container">
                    {product.image && typeof product.image === 'string' && product.image.trim().length > 0 ? (
                        <>
                            {!imageLoaded && (
                                <div className="absolute inset-0 skeleton" />
                            )}
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className={`object-cover image-zoom transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                unoptimized
                                onLoad={() => setImageLoaded(true)}
                            />
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-6xl opacity-30">📷</span>
                        </div>
                    )}

                    {/* Overlay with Actions */}
                    <div
                        className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-3 ${isHovered ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <button
                            onClick={handleAddToCart}
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                            title="Tambah ke Keranjang"
                        >
                            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <div className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-110">
                            <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Stock Badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                            Stok Terbatas
                        </div>
                    )}

                    {product.stock === 0 && (
                        <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Habis
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-5">
                    {/* Category Badge */}
                    <div className="mb-2">
                        <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium rounded-full capitalize">
                            {product.category}
                        </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {product.name}
                    </h3>

                    {/* Product Description - Hidden on mobile */}
                    <p className="hidden sm:block text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                    </p>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mt-2 sm:mt-0">
                        <div>
                            <div className="text-base sm:text-2xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                                Stok: {product.stock}
                            </div>
                        </div>

                        {/* Quick Add Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${product.stock === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 text-white hover:bg-gray-800 button-ripple'
                                }`}
                            title="Tambah ke Keranjang"
                        >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-900 rounded-2xl transition-all duration-300 pointer-events-none" />
            </div>
        </Link>
    );
}
