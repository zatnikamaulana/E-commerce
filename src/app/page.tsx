'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Package, Truck, Shield } from 'lucide-react';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response.success && response.data) {
        const products = response.data.products || [];
        setFeaturedProducts(products.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Truck,
      title: 'Gratis Ongkir',
      description: 'Untuk pembelian di atas Rp 100.000'
    },
    {
      icon: Package,
      title: 'Produk Terbaru',
      description: 'Update koleksi setiap minggu'
    },
    {
      icon: Shield,
      title: 'Garansi Kualitas',
      description: 'Jaminan produk original 100%'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean & Modern */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Background Image - Very Subtle */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.png"
            alt="Background"
            fill
            className="object-cover"
            style={{
              opacity: 0.03,
              transform: `translateY(${scrollY * 0.3}px)`
            }}
            priority
            unoptimized
          />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left space-y-8 fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg hover-lift">
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                <span>Koleksi Terbaru 2026</span>
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Elevate Your
                  <span className="block mt-2 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Style
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Temukan aksesoris fashion terbaik untuk melengkapi penampilanmu.
                  Trendy, berkualitas, dan terjangkau.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button size="lg" className="group shadow-lg hover:shadow-xl transition-all">
                    <span>Belanja Sekarang</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="hover:bg-gray-50">
                    Lihat Koleksi
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
                  <div className="text-sm text-gray-600">Produk</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
                  <div className="text-sm text-gray-600">Pelanggan</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900 mb-1">4.9</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Side - Model Image */}
            <div className="relative hidden lg:block fade-in-up stagger-1">
              <div className="relative h-[600px] w-full">
                {/* Decorative Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-50 blur-3xl" />

                {/* Model Image */}
                <div
                  className="relative h-full w-full"
                  style={{
                    transform: `translateY(${scrollY * 0.1}px)`
                  }}
                >
                  <Image
                    src="/images/model-accessories.png"
                    alt="Model"
                    fill
                    className="object-contain drop-shadow-2xl"
                    style={{
                      filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15))'
                    }}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-gray-300 rounded-full opacity-30" />
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-gray-300 rounded-lg opacity-20" />
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Horizontal Scroll, Desktop: Grid */}
          <div className="md:grid md:grid-cols-3 md:gap-8 flex overflow-x-auto gap-4 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group text-center p-6 sm:p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200 fade-in-up stagger-${index + 1} min-w-[280px] md:min-w-0 snap-center flex-shrink-0`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-900 text-white rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Produk Pilihan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Koleksi terbaik yang dipilih khusus untuk kamu
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                  <div className="bg-gray-200 h-4 rounded mb-2" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`fade-in-up stagger-${index + 1}`}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-12 fade-in-up stagger-5">
                <Link href="/products">
                  <Button variant="outline" size="lg" className="group shadow-sm hover:shadow-md">
                    <span>Lihat Semua Produk</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-20">📦</div>
              <p className="text-gray-500 text-lg">Belum ada produk tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white overflow-hidden">
        {/* Background Image - Very Subtle */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cta-background.png"
            alt="Background"
            fill
            className="object-cover"
            style={{
              opacity: 0.08
            }}
            unoptimized
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90 z-0" />

        {/* Content */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="space-y-8 fade-in-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Siap Tampil Lebih
              <span className="block mt-2">Percaya Diri?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Dapatkan diskon 10% untuk pembelian pertama kamu.
              Mulai belanja sekarang dan temukan style-mu!
            </p>
            <div className="pt-4">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="group shadow-xl hover:shadow-2xl">
                  <span>Mulai Belanja</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-24 h-24 border border-white/10 rounded-full" />
        <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-lg" />
      </section>
    </div>
  );
}
