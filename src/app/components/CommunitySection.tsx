import React from 'react';
import Image from 'next/image';
import {Heart, Globe, Star} from 'lucide-react';
import {SiDiscord, SiGithub, SiTwitch, SiX, SiYoutube, SiTelegram} from "@icons-pack/react-simple-icons";
import {getAllContributorsByRole, getRoleConfig} from "@/data/community";
import {PartnerContributor, StandardContributor} from "@/types/community";

// Platform icons helper
const getPlatformIcon = (platform?: string) => {
    switch (platform) {
        case 'youtube':
            return <SiYoutube size={16}/>;
        case 'twitch':
            return <SiTwitch size={16}/>;
        case 'github':
            return <SiGithub size={16}/>;
        case 'discord':
            return <SiDiscord size={16}/>;
        case 'x':
            return <SiX size={16}/>;
        case 'telegram':
            return <SiTelegram size={16}/>;
        default:
            return <Globe size={16}/>;
    }
};

// Enhanced Partner Card Component
const PartnerCard = ({partner}: { partner: PartnerContributor }) => {
    const roleConfig = getRoleConfig(partner.role);

    // Custom component override
    if (partner.customComponent) {
        const CustomComponent = partner.customComponent;
        return <CustomComponent/>;
    }

    // Enhanced partner card with highlighting
    return (
        <div className={`
            ${partner.highlighted
            ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-2 border-yellow-600/80 shadow-lg shadow-yellow-900/20'
            : `${roleConfig.bgColor} border ${roleConfig.borderColor}`
        }
            rounded-sm p-6 relative overflow-hidden group hover:border-olive-600 transition-all duration-300
        `}>
            {/* Featured badge */}
            {partner.featured && (
                <div className="absolute top-2 right-2">
                    <div
                        className="flex items-center gap-1 bg-yellow-600/20 border border-yellow-600/50 rounded-sm px-2 py-1">
                        <Star size={12} className="text-yellow-400"/>
                        <span className="text-xs text-yellow-300 font-medium">Featured</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 mb-4">
                {partner.logo && (
                    <Image
                        src={partner.logo}
                        alt={`${partner.name} Logo`}
                        unoptimized={true}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-yellow-600/60"
                    />
                )}
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-tan-100 group-hover:text-yellow-300 transition-colors">
                        {partner.name}
                    </h3>
                    <p className={`text-sm ${roleConfig.color} font-medium`}>
                        {roleConfig.label}
                    </p>
                </div>
            </div>

            {partner.description && (
                <p className="text-sm text-tan-300 mb-4 leading-relaxed">
                    {partner.description}
                </p>
            )}

            {/* Tags */}
            {partner.tags && partner.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {partner.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="text-xs bg-military-700/50 border border-military-600 rounded-sm px-2 py-1 text-tan-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Link */}
            {partner.link && (
                <a
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/20 border border-yellow-600/50 rounded-sm text-yellow-300 hover:bg-yellow-600/30 hover:border-yellow-500 transition-all font-medium text-sm"
                >
                    {getPlatformIcon(partner.platform)}
                    <span>Visit Channel</span>
                </a>
            )}
        </div>
    );
};

// Standard Contributor Card Component
const ContributorCard = ({contributor}: { contributor: StandardContributor }) => {
    if (!contributor.featured) return null;
    const roleConfig = getRoleConfig(contributor.role);

    return (
        <a
            href={contributor.link || '#'}
            target={contributor.link ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`
                military-card p-4 rounded-sm border ${roleConfig.borderColor} ${roleConfig.bgColor} 
                hover:border-olive-600 transition-all group cursor-pointer block
            `}
        >
            <div className="flex items-center gap-3">
                {/* Role icon/initial */}
                <div
                    className={`w-10 h-10 rounded-sm ${roleConfig.bgColor} ${contributor.logo ? "" : "border "+ roleConfig.borderColor } flex items-center justify-center flex-shrink-0`}>
                    {contributor.logo ? (
                            <Image
                                src={contributor.logo}
                                alt={`${contributor.name} Logo`}
                                unoptimized={true}
                                width={40}
                                height={40}
                                className={`rounded-full border-2 ${roleConfig.borderColor}`}
                            />
                        )
                        : contributor.platform ? (
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
                    <h3 className="text-sm font-semibold text-tan-100 group-hover:text-olive-400 transition-colors truncate">
                        {contributor.name}
                    </h3>
                    <p className={`text-xs ${roleConfig.color} truncate`}>
                        {roleConfig.label}
                    </p>
                </div>

                {/* External link indicator */}
                {contributor.link && (
                    <span className="text-tan-500 group-hover:text-olive-400 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </span>
                )}
            </div>

            {/* Optional: Show description */}
            {contributor.description && (
                <p className="text-xs text-tan-300 mt-2 line-clamp-2">
                    {contributor.description}
                </p>
            )}
        </a>
    );
};

// Section Header Component
const SectionHeader = ({title, description, icon: Icon}: {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ size: number; className?: string }>;
}) => (
    <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
            {Icon && <Icon size={24} className="text-olive-400"/>}
            <h3 className="text-2xl font-bold text-tan-100 military-stencil">
                {title}
            </h3>
        </div>
        {description && (
            <p className="text-tan-300 max-w-2xl mx-auto">
                {description}
            </p>
        )}
    </div>
);

// Main CommunitySection Component
export default function CommunitySection() {
    const {partners, creators, contributors, supporters} = getAllContributorsByRole();

    return (
        <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Main Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-tan-100 mb-4 military-stencil">
                        Community & Contributors
                    </h2>
                    <p className="text-lg text-tan-300 max-w-3xl mx-auto">
                        ExfilZone Assistant is powered by an amazing community of players, creators, and contributors
                        who help make this resource better for everyone.
                    </p>
                </div>

                {/* Partners Section - Priority positioning */}
                {partners.length > 0 && (
                    <div className="mb-16">
                        <SectionHeader
                            title="Partners"
                            description="Special thanks to our community partners who help grow and improve the project"
                            icon={Star}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partners.map((partner, index) => (
                                <PartnerCard key={`partner-${index}`} partner={partner}/>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Contributors */}
                <div className="space-y-12">
                    {/* Community Supporters */}
                    {supporters.length > 0 && (
                        <div>
                            <SectionHeader
                                title="Community Supporters"
                                description="Valued community members who support and help the project"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {supporters.map((supporter, index) => (
                                    <ContributorCard key={`supporter-${index}`} contributor={supporter}/>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Creators */}
                    {creators.length > 0 && (
                        <div>
                            <SectionHeader
                                title="Content Creators"
                                description="Community members creating valuable content and guides"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {creators.map((creator, index) => (
                                    <ContributorCard key={`creator-${index}`} contributor={creator}/>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Contributors */}
                    {contributors.length > 0 && (
                        <div>
                            <SectionHeader
                                title="Contributors"
                                description="Developers and technical contributors improving the platform"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {contributors.map((contributor, index) => (
                                    <ContributorCard key={`contributor-${index}`} contributor={contributor}/>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="bg-military-800 border border-olive-700 rounded-sm p-8 text-center mt-16">
                    <h3 className="text-2xl font-bold text-tan-100 mb-4">
                        Join Our Community
                    </h3>
                    <p className="text-tan-300 mb-6 max-w-2xl mx-auto">
                        Whether you&#39;re a content creator, developer, or passionate player, there are many ways to
                        contribute to the ExfilZone Assistant project.
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