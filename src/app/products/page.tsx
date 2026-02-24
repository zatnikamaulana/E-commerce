'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import { Product, CategoryType } from '@/types';
import { categories } from '@/data/products';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, selectedCategory]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const response = await productsAPI.getAll();
            if (response.success && response.data) {
                setProducts(response.data.products || []);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(filtered);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Semua Produk
                    </h1>
                    <p className="text-lg text-gray-600">
                        Temukan aksesoris favoritmu dari koleksi lengkap kami
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-8 fade-in-up stagger-1">
                    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gray-900 transition-colors" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <X className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                )}
                            </div>

                            {/* Filter Button (Mobile) */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 button-ripple"
                            >
                                <Filter className="w-5 h-5" strokeWidth={1.5} />
                                <span>Filter</span>
                            </button>
                        </div>

                        {/* Category Filters */}
                        <div className={`mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${selectedCategory === 'all'
                                        ? 'bg-gray-900 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Semua
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-6 py-2.5 rounded-xl font-medium capitalize transition-all duration-300 transform hover:scale-105 ${selectedCategory === category
                                            ? 'bg-gray-900 text-white shadow-lg scale-105'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            {/* Clear Filters */}
                            {(searchQuery || selectedCategory !== 'all') && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline-animate transition-colors"
                                >
                                    Hapus semua filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 fade-in-up stagger-2">
                    <p className="text-gray-600">
                        Menampilkan <span className="font-semibold text-gray-900">{filteredProducts.length}</span> produk
                        {selectedCategory !== 'all' && (
                            <span> dalam kategori <span className="font-semibold text-gray-900 capitalize">{selectedCategory}</span></span>
                        )}
                    </p>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-square rounded-2xl mb-4 skeleton" />
                                <div className="bg-gray-200 h-4 rounded mb-2 skeleton" />
                                <div className="bg-gray-200 h-4 rounded w-2/3 skeleton" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className={`fade-in-up stagger-${Math.min(index % 6 + 1, 6)}`}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 fade-in-up">
                        <div className="text-6xl mb-6 opacity-30">🔍</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                            Produk tidak ditemukan
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Coba ubah kata kunci pencarian atau filter kategori
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 button-ripple hover-lift"
                        >
                            Hapus Filter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
