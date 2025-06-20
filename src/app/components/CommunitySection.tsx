// Create a new file: src/components/home/CommunitySection.tsx

import React from 'react';
import {Heart, Globe} from 'lucide-react';
import {SiDiscord, SiGithub, SiTwitch, SiYoutube} from "@icons-pack/react-simple-icons";

interface Contributor {
    name: string;
    role: 'creator' | 'contributor' | 'donator' | 'partner';
    description?: string;
    link?: string;
    platform?: 'youtube' | 'twitch' | 'website' | 'github';
}

const contributors: Contributor[] = [
    // Add your actual contributors here
    {
        name: 'zaymax',
        role: 'donator',
    },
    {
        name: 'Aboleth',
        role: 'creator',
        description: 'Deep Dives into VR games.',
        link: 'https://abolethvr.substack.com/',
        platform: 'website'
    },

];

const getPlatformIcon = (platform?: string) => {
    switch (platform) {
        case 'youtube':
            return <SiYoutube size={16}/>;
        case 'twitch':
            return <SiTwitch size={16}/>;
        case 'github':
            return <SiGithub size={16}/>;
        default:
            return <Globe size={16}/>;
    }
};

const getRoleConfig = (role: string) => {
    switch (role) {
        case 'donator':
            return {
                label: 'Supporter',
                color: 'text-purple-400',
                borderColor: 'border-purple-700',
                bgColor: 'bg-purple-900/20'
            };
        case 'contributor':
            return {
                label: 'Contributor',
                color: 'text-blue-400',
                borderColor: 'border-blue-700',
                bgColor: 'bg-blue-900/20'
            };
        case 'creator':
            return {
                label: 'Content Creator',
                color: 'text-green-400',
                borderColor: 'border-green-700',
                bgColor: 'bg-green-900/20'
            };
        case 'partner':
            return {
                label: 'Partner',
                color: 'text-yellow-400',
                borderColor: 'border-yellow-700',
                bgColor: 'bg-yellow-900/20'
            };
        default:
            return {
                label: role,
                color: 'text-tan-400',
                borderColor: 'border-military-700',
                bgColor: 'bg-military-800'
            };
    }
};

export default function CommunitySection() {
    return (
        <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-tan-100 mb-4 military-stencil">
                        Community & Contributors
                    </h2>
                    <p className="text-lg text-tan-300 max-w-3xl mx-auto">
                        Exfil Zone Assistant is powered by an amazing community of players, creators, and contributors
                        who help make this resource better for everyone.
                    </p>
                </div>

                {/* Contributors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {contributors.map((contributor, index) => {
                        const roleConfig = getRoleConfig(contributor.role);

                        return (
                            <a
                                key={index}
                                href={contributor.link || '#'}
                                target={contributor.link ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className={`military-card p-4 rounded-sm border ${roleConfig.borderColor} ${roleConfig.bgColor} 
          hover:border-olive-600 transition-all group cursor-pointer block`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Role icon/initial */}
                                    <div
                                        className={`w-10 h-10 rounded-sm ${roleConfig.bgColor} border ${roleConfig.borderColor} 
            flex items-center justify-center flex-shrink-0`}>
                                        {contributor.platform ? (
                                            <span className={roleConfig.color}>
                {getPlatformIcon(contributor.platform)}
              </span>
                                        ) : (
                                            <span className={`text-sm font-bold ${roleConfig.color}`}>
                {contributor.name.charAt(0).toUpperCase()}
              </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-tan-100 group-hover:text-olive-400
              transition-colors truncate">
                                            {contributor.name}
                                        </h3>
                                        <p className={`text-xs ${roleConfig.color} truncate`}>
                                            {roleConfig.label}
                                        </p>
                                    </div>

                                    {/* External link indicator */}
                                    {contributor.link && (
                                        <span
                                            className="text-tan-500 group-hover:text-olive-400 transition-colors flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </span>
                                    )}
                                </div>

                                {/* Optional: Show description on hover as tooltip */}
                                {contributor.description && (
                                    <p className="text-xs text-tan-300 mt-2 line-clamp-2">
                                        {contributor.description}
                                    </p>
                                )}
                            </a>
                        );
                    })}
                </div>

                {/* Call to Action */}
                <div className="bg-military-800 border border-olive-700 rounded-sm p-8 text-center">
                    <h3 className="text-2xl font-bold text-tan-100 mb-4">
                        Join Our Community
                    </h3>
                    <p className="text-tan-300 mb-6 max-w-2xl mx-auto">
                        Whether you&#39;re a content creator, developer, or passionate player, there are many ways to
                        contribute
                        to the Exfil Zone Assistant project.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="https://discord.gg/2FCDZK6C25"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-olive-600 hover:bg-olive-500
                        text-military-900 font-medium rounded-sm transition-colors"
                        >
                            <SiDiscord size={20}/>
                            Join Discord
                        </a>

                        <a
                            href="https://github.com/zelengeo/exfil-zone-assistant"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-military-700 hover:bg-military-600
                    text-tan-100 font-medium rounded-sm transition-colors border border-military-600"
                        >
                            <SiGithub size={20}/>
                            Contribute on GitHub
                        </a>

                        <a
                            href="https://ko-fi.com/J3J41GATK0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-military-700 hover:bg-military-600
                text-tan-100 font-medium rounded-sm transition-colors border border-military-600"
                        >
                            <Heart size={20} className="text-red-400"/>
                            Support Us
                        </a>
                    </div>
                </div>

                {/* Special Thanks */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-tan-400">
                        Special thanks to all our supporters and the Contractors Showdown community!
                    </p>
                </div>
            </div>
        </section>
    );
}