'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X } from 'lucide-react';
import { Item } from '@/types/items';

interface ItemImageProps {
    item: Item;
    size?: 'icon' | 'thumbnail' | 'fullsize';
    className?: string;
    showZoom?: boolean;
    showPlaceholder?: boolean;
}

export const ItemImage: React.FC<ItemImageProps> = ({
                                                        item,
                                                        size = 'icon',
                                                        className = '',
                                                        showZoom = false,
                                                        showPlaceholder = true
                                                    }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);

    const imageSrc = item.images[size];

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const toggleZoom = () => {
        if (showZoom) {
            setIsZoomed(!isZoomed);
        }
    };

    // Fallback component
    const ImageFallback = () => (
        <div className={`flex items-center justify-center bg-military-800 ${className}`}>
            {showPlaceholder ? (
                <div className="text-center p-2">
                    <div className="text-olive-500 text-sm font-medium mb-1 truncate">{item.name}</div>
                    <div className="text-military-400 text-xs">No image</div>
                </div>
            ) : (
                <div className="w-8 h-8 bg-military-700 rounded-sm"></div>
            )}
        </div>
    );

    // Loading component
    const ImageLoading = () => (
        <div className={`flex items-center justify-center bg-military-800 ${className}`}>
            <div className="animate-spin w-6 h-6 border-2 border-olive-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (imageError) {
        return <ImageFallback />;
    }

    return (
        <>
            <div className={`relative ${className} ${showZoom ? 'cursor-pointer group' : ''}`}>
                {/* Loading state */}
                {imageLoading && <ImageLoading />}

                {/* Main image */}
                <div
                    className={`relative w-full h-full ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    onClick={toggleZoom}
                >
                    <Image
                        src={imageSrc}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        sizes="(max-width: 768px) 200px, 300px"
                    />
                </div>

                {/* Zoom indicator */}
                {showZoom && !imageLoading && !imageError && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-military-900/80 border border-military-600 rounded-sm p-1">
                            <ZoomIn size={12} className="text-olive-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Zoom modal */}
            {isZoomed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-military-950/90">
                    {/* Close button */}
                    <button
                        onClick={toggleZoom}
                        className="absolute top-4 right-4 w-10 h-10 bg-military-800 border border-military-700 rounded-sm flex items-center justify-center text-tan-300 hover:text-tan-100 hover:bg-military-700 z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Zoomed image */}
                    <div className="relative max-w-4xl max-h-4xl w-full h-full m-8">
                        <Image
                            src={item.images.fullsize}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 80vw"
                            priority
                        />
                    </div>

                    {/* Item info overlay */}
                    <div className="absolute bottom-4 left-4 bg-military-800/90 border border-military-700 rounded-sm p-4 max-w-md">
                        <h3 className="text-xl font-bold text-tan-100 mb-2">{item.name}</h3>
                        <p className="text-tan-300 text-sm">{item.description}</p>
                    </div>

                    {/* Click outside to close */}
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={toggleZoom}
                    />
                </div>
            )}
        </>
    );
};

// Simplified version for basic use cases
export const SimpleItemImage: React.FC<{
    src: string;
    alt: string;
    className?: string;
}> = ({ src, alt, className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (imageError) {
        return (
            <div className={`flex items-center justify-center bg-military-800 ${className}`}>
                <div className="w-6 h-6 bg-military-700 rounded-sm"></div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-military-800">
                    <div className="animate-spin w-4 h-4 border border-olive-600 border-t-transparent rounded-full"></div>
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoading(false)}
                sizes="100px"
            />
        </div>
    );
};

export default ItemImage;