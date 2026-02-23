'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
    images: string[];
    productName: string;
}

export default function ImageSlider({ images, productName }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Filter out empty images
    const validImages = images.filter(img => img && img.trim().length > 0);

    // If no images, show placeholder
    if (validImages.length === 0) {
        return (
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-30">📷</span>
                </div>
            </div>
        );
    }

    const goToPrevious = () => {
        setImageLoaded(false);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setImageLoaded(false);
        setCurrentIndex((prevIndex) =>
            prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index: number) => {
        setImageLoaded(false);
        setCurrentIndex(index);
    };

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                {/* Loading Skeleton */}
                {!imageLoaded && (
                    <div className="absolute inset-0 skeleton" />
                )}

                {/* Image */}
                <Image
                    src={validImages[currentIndex]}
                    alt={`${productName} - Image ${currentIndex + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Navigation Arrows - Only show if more than 1 image */}
                {validImages.length > 1 && (
                    <>
                        {/* Previous Button */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" strokeWidth={2} />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {currentIndex + 1} / {validImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails - Only show if more than 1 image */}
            {validImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {validImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${index === currentIndex
                                    ? 'ring-2 ring-gray-900 scale-105'
                                    : 'ring-1 ring-gray-200 hover:ring-gray-400 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`${productName} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Dots Indicator - Alternative to thumbnails for mobile */}
            {validImages.length > 1 && validImages.length <= 5 && (
                <div className="flex justify-center gap-2 md:hidden">
                    {validImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'w-8 bg-gray-900'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
