import React from 'react';
import Image from 'next/image';
import {Heart, Globe, Star} from 'lucide-react';
import {SiDiscord, SiGithub, SiTwitch, SiX, SiYoutube, SiTelegram} from "@icons-pack/react-simple-icons";
import {cn} from "@/lib/utils";
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

    return (
        <div className={cn(
            "p-6 relative overflow-hidden group transition-colors",
            partner.highlighted
                ? "bg-steel-800 border-2 border-warn/60"
                : cn(roleConfig.bgColor, "border", roleConfig.borderColor),
            "hover:border-line-500"
        )}>
            {/* Featured badge */}
            {partner.featured && (
                <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 border border-warn/50 px-2 py-1">
                        <Star size={12} className="text-warn"/>
                        <span className="font-mono text-[9px] tracking-micro uppercase text-warn">Featured</span>
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
                        className="border border-warn/60"
                    />
                )}
                <div className="flex-1">
                    <h3 className="font-display font-bold uppercase tracking-tight text-lg text-ink-100 group-hover:text-warn transition-colors">
                        {partner.name}
                    </h3>
                    <p className={cn("font-mono text-[10px] tracking-micro uppercase mt-0.5", roleConfig.color)}>
                        {roleConfig.label}
                    </p>
                </div>
            </div>

            {partner.description && (
                <p className="text-sm text-ink-400 mb-4 leading-relaxed">
                    {partner.description}
                </p>
            )}

            {/* Tags */}
            {partner.tags && partner.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {partner.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="font-mono text-[10px] tracking-micro uppercase border border-line-600 px-2 py-1 text-ink-400"
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
                    className="inline-flex items-center gap-2 px-4 py-2 border border-warn/50 text-warn hover:bg-steel-700 transition-colors font-display font-semibold uppercase tracking-nav text-sm"
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
            className={cn(
                "p-4 border transition-colors group cursor-pointer block",
                roleConfig.bgColor, roleConfig.borderColor,
                "hover:border-line-500"
            )}
        >
            <div className="flex items-center gap-3">
                {/* Role icon/initial */}
                <div className={cn(
                    "w-10 h-10 flex items-center justify-center flex-shrink-0 border",
                    contributor.logo ? "border-transparent" : roleConfig.borderColor
                )}>
                    {contributor.logo ? (
                            <Image
                                src={contributor.logo}
                                alt={`${contributor.name} Logo`}
                                unoptimized={true}
                                width={40}
                                height={40}
                                className={cn("border", roleConfig.borderColor)}
                            />
                        )
                        : contributor.platform ? (
                            <span className={roleConfig.color}>
                            {getPlatformIcon(contributor.platform)}
                        </span>
                        ) : (
                            <span className={cn("font-display font-bold text-sm", roleConfig.color)}>
                            {contributor.name.charAt(0).toUpperCase()}
                        </span>
                        )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-ink-100 group-hover:text-info transition-colors truncate">
                        {contributor.name}
                    </h3>
                    <p className={cn("font-mono text-[9px] tracking-micro uppercase mt-0.5 truncate", roleConfig.color)}>
                        {roleConfig.label}
                    </p>
                </div>

                {/* External link indicator */}
                {contributor.link && (
                    <span className="text-ink-600 group-hover:text-info transition-colors flex-shrink-0">
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
                <p className="text-xs text-ink-400 mt-2 line-clamp-2">
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
            {Icon && <Icon size={20} className="text-info"/>}
            <h3 className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100">
                {title}
            </h3>
        </div>
        {description && (
            <p className="text-ink-400 max-w-2xl mx-auto">
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
                    <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl md:text-4xl text-ink-100 mb-4">
                        Community &amp; Contributors
                    </h2>
                    <p className="text-lg text-ink-400 max-w-3xl mx-auto">
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
                <div className="bg-steel-800 border border-line-800 p-8 text-center mt-16 clip-shoulder">
                    <h3 className="font-display font-bold uppercase tracking-tight text-2xl text-ink-100 mb-4">
                        Join Our Community
                    </h3>
                    <p className="text-ink-400 mb-6 max-w-2xl mx-auto">
                        Whether you&#39;re a content creator, developer, or passionate player, there are many ways to
                        contribute to the ExfilZone Assistant project.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <a
                            href="https://discord.gg/2FCDZK6C25"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-ember hover:bg-ember-hover
                        text-ember-ink font-display font-bold uppercase tracking-nav transition-colors"
                        >
                            <SiDiscord size={20}/>
                            Join Discord
                        </a>

                        <a
                            href="https://github.com/zelengeo/exfil-zone-assistant"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-line-500 hover:bg-steel-700
                    text-ink-200 font-display font-bold uppercase tracking-nav transition-colors"
                        >
                            <SiGithub size={20}/>
                            Contribute on GitHub
                        </a>

                        <a
                            href="https://ko-fi.com/J3J41GATK0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-line-500 hover:bg-steel-700
                text-ink-200 font-display font-bold uppercase tracking-nav transition-colors"
                        >
                            <Heart size={20} className="text-ember"/>
                            Support Us
                        </a>
                    </div>
                </div>

                {/* Special Thanks */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-ink-500">
                        Special thanks to all our supporters and the Contractors Showdown community!
                    </p>
                </div>
            </div>
        </section>
    );
}
