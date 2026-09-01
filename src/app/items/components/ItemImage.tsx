'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X } from 'lucide-react';
import { Item } from '@/types/items';
import { cn } from '@/lib/utils';

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

    // Rendered inline rather than as nested components: declaring a component inside a render
    // remounts it on every pass, which resets the very loading state it is displaying.
    if (imageError) {
        return (
            <div className={cn('flex items-center justify-center bg-steel-850', className)}>
                {showPlaceholder ? (
                    <div className="text-center p-2 min-w-0">
                        <div className="text-xs text-ink-500 mb-0.5 truncate">{item.name}</div>
                        <div className="micro-label text-ink-700">No image</div>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-steel-750" />
                )}
            </div>
        );
    }

    return (
        <>
            <div className={cn('relative', showZoom && 'cursor-pointer group', className)}>
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-steel-850">
                        <div className="w-6 h-6 border border-line-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div
                    className={cn(
                        'relative w-full h-full transition-opacity',
                        imageLoading ? 'opacity-0' : 'opacity-100',
                    )}
                    onClick={toggleZoom}
                >
                    <Image
                        src={imageSrc}
                        alt={item.name}
                        unoptimized
                        fill
                        className="object-contain p-1"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        sizes="(max-width: 768px) 200px, 300px"
                    />
                </div>

                {showZoom && !imageLoading && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-steel-950/85 border border-line-700 p-1">
                            <ZoomIn size={12} className="text-ink-400" />
                        </div>
                    </div>
                )}
            </div>

            {isZoomed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-steel-950/90">
                    <button
                        type="button"
                        onClick={toggleZoom}
                        aria-label="Close"
                        className="absolute top-4 right-4 w-10 h-10 bg-steel-800 border border-line-700 flex items-center justify-center text-ink-400 hover:text-ink-hi hover:bg-steel-700 z-10 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="relative max-w-4xl w-full h-full m-8">
                        <Image
                            src={item.images.fullsize}
                            alt={item.name}
                            unoptimized
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 80vw"
                            priority
                        />
                    </div>

                    <div className="absolute bottom-4 left-4 bg-steel-900/95 border border-line-800 p-4 max-w-md">
                        <h3 className="font-display text-lg text-ink-hi mb-1">{item.name}</h3>
                        <p className="text-xs text-ink-400 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="absolute inset-0 -z-10" onClick={toggleZoom} />
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
            <div className={cn('flex items-center justify-center bg-steel-850', className)}>
                <div className="w-6 h-6 bg-steel-750" />
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-steel-850">
                    <div className="w-4 h-4 border border-line-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                unoptimized
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
