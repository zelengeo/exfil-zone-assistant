import React from 'react';
import Image from 'next/image';
import {Star,} from 'lucide-react';
import {SiYoutube, SiTwitch, SiX} from "@icons-pack/react-simple-icons";

const HayaPlaysCard = () => (
    <div
        className="bg-gradient-to-br from-red-900/30 via-orange-900/20 to-yellow-900/10 border-2 border-red-600/80 rounded-sm p-6 relative overflow-hidden group shadow-xl shadow-red-900/20">
        {/* Animated background */}
        <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Featured Partner Badge */}
        <div className="absolute top-3 right-3">
            <div
                className="flex items-center gap-1 bg-red-600/30 border border-red-500/60 rounded-sm px-2 py-1 backdrop-blur-sm">
                <Star size={12} className="text-yellow-400 fill-current"/>
                <span className="text-xs text-yellow-300 font-bold">PARTNER</span>
            </div>
        </div>

        {/* Header with logo and name */}
        <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="relative">
                <Image
                    src="/images/community/haya-logo-70x70.webp"
                    alt="HayaPlays Logo"
                    unoptimized={true}
                    width={56}
                    height={56}
                    className="rounded-full border-2 border-red-500 shadow-lg"
                />
                <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-military-900 animate-pulse"></div>
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-tan-100 group-hover:text-red-300 transition-colors">
                    HayaPlays
                </h3>
                <p className="text-sm text-red-400 font-semibold">
                    Content Partner
                </p>
            </div>
        </div>

        {/* Description */}
        <p className="text-sm text-tan-300 mb-4 leading-relaxed relative z-10">
            VR Gaming Content Creator specializing in tactical shooters and immersive gameplay experiences.
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 relative z-10">
            <a
                href="https://www.youtube.com/watch?v=HlrpOd4YioA"
                target="_blank"
                className="flex items-center gap-2 py-1 px-2 bg-red-600 border-2 border-red-500 rounded-sm text-black font-bold transition-all duration-200 hover:bg-red-500 hover:border-red-400 hover:scale-105 transform"
                title="YouTube Channel"
            >
                <SiYoutube size={16}/>
                <span className="text-sm">WATCH</span>
            </a>

            <a
                href="https://x.com/hayaplays"
                target="_blank"
                className="p-2 bg-black/40 rounded-sm text-tan-400 hover:text-blue-400 hover:bg-black/60 transition-all border border-military-600 hover:border-blue-600"
                title="X (Twitter)"
            >
                <SiX size={16}/>
            </a>
            <a
                href="https://twitch.tv/hayaplays"
                target="_blank"
                className="p-2 bg-black/40 rounded-sm text-tan-400 hover:text-purple-400 hover:bg-black/60 transition-all border border-military-600 hover:border-purple-600"
                title="Twitch"
            >
                <SiTwitch size={16}/>
            </a>
        </div>
    </div>
);

export default HayaPlaysCard;