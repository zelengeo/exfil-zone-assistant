'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image'
import {ArrowRight} from 'lucide-react';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
    ctaSecondary?: {
        text: string;
        link: string;
    };
}

// Define your slides here
const slides: Slide[] = [
    {
        id: "home",
        title: "EXFILZONE",
        subtitle: "VR EXTRACTION ASSISTANT",
        description: "Your ultimate tactical companion for the VR extraction shooter experience",
        backgroundImage: "/images/hero/press_img_1920x1080.webp", // Add your image
        ctaText: "Start Here",
        ctaLink: "/guides/getting-started",
    },
    {
        id: "combat-sim",
        title: "COMBAT SIMULATOR",
        subtitle: "DAMAGE CALCULATION",
        description: "Compare performance of each weapon and ammunition against any armor",
        backgroundImage: "/images/hero/sim_img.webp", // Add your image
        ctaText: "Check TTK",
        ctaLink: "/combat-sim"
    },
    {
        id: "items",
        title: "ITEMS DATABASE",
        subtitle: "COMPLETE ARSENAL",
        description: "Browse 500+ weapons, equipment, and items with detailed stats and locations",
        backgroundImage: "/images/hero/items_img.webp", // Add your image
        ctaText: "Browse Items",
        ctaLink: "/items"
    },
    {
        id: "hideout",
        title: "HIDEOUT SYSTEM",
        subtitle: "UPGRADE YOUR BASE",
        description: "Plan your hideout upgrades, track requirements, and maximize efficiency",
        backgroundImage: "/images/hero/hideout_img.webp", // Add your image
        ctaText: "View Hideout",
        ctaLink: "/hideout-upgrades"
    },
    {
        id: "guides",
        title: "TACTICAL GUIDES",
        subtitle: "MASTER THE GAME",
        description: "In-depth guides for combat, movement, and advanced strategies",
        backgroundImage: "/images/hero/guide_img.webp", // Add your image
        ctaText: "Read Guides",
        ctaLink: "/guides"
    }
    //TODO
    // {
    //     id: 5,
    //     title: "JOIN THE COMMUNITY",
    //     subtitle: "SQUAD UP",
    //     description: "Connect with players, share strategies, and stay updated",
    //     backgroundImage: "/images/hero/slide-5.jpg", // Add your image
    //     ctaText: "Get Involved",
    //     ctaLink: "#community"
    // }
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-advance slides
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 7000); // 7 seconds per slide

            return () => clearInterval(interval);
        }
    }, [isPaused]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <section
            className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Images */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {/* Gradient Overlay */}

                    {/* Background Image */}
                    <div className="absolute inset-0 bg-military-800">
                        <div className="relative w-full h-full overflow-hidden">
                            <Image
                                src={slide.backgroundImage}
                                alt={slide.title}
                                width={1000}
                                height={500}
                                className="absolute min-w-full w-auto h-auto max-w-none
                                -right-4/5
                 md:top-1/2  md:-translate-y-3/7
                 md:left-auto md:right-0 md:translate-x-0"
                            />
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-military-900 via-military-900/85 to-transparent z-10"/>
                        </div>
                    </div>
                </div>
            ))}

            {/* Content */}
            <div className="absolute inset-0 z-20 flex items-center">
                <div className="container mx-auto px-6">
                    <div className="max-w-xl relative min-h-[300px]">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`transition-all duration-500 ${
                                    index === currentSlide
                                        ? 'opacity-100 transform translate-x-0 relative'
                                        : 'opacity-0 transform -translate-x-full pointer-events-none absolute inset-0'
                                }`}
                            >
                                <div className="inline-block mb-4 px-3 py-1 border border-olive-500 bg-military-800/80">
                                    <h2 className="text-olive-400 military-stencil">{slide.subtitle}</h2>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tan-100 mb-4 military-stencil">
                                    {slide.title}
                                </h1>

                                <div className="bg-military-900/80 border border-olive-700 p-4 mb-8">
                                    <p className="text-xl md:text-2xl text-tan-200">
                                        {slide.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={slide.ctaLink}
                                        className="bg-olive-600 hover:bg-olive-500 text-tan-100 px-6 py-3 rounded-sm font-medium text-lg transition-colors flex items-center gap-2 border border-olive-500 hover:border-olive-400"
                                    >
                                        {slide.ctaText}
                                        <ArrowRight size={20}/>
                                    </Link>

                                    {slide.ctaSecondary && (
                                        <Link
                                            href={slide.ctaSecondary.link}
                                            className="bg-military-800/80 hover:bg-military-700 text-tan-100 px-6 py-3 rounded-sm font-medium text-lg transition-colors border border-olive-700 hover:border-olive-500"
                                        >
                                            {slide.ctaSecondary.text}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-0 right-0 z-30">
                <div className="container mx-auto px-6">
                    {/* Dots */}
                    <div className="flex items-center justify-end gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`min-w-2 min-h-2 w-2 h-2 rounded-full transition-all ${
                                    index === currentSlide
                                        ? 'bg-olive-400 w-8'
                                        : 'bg-olive-700 hover:bg-olive-600'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}