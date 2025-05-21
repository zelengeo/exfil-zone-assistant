import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown } from 'lucide-react';

interface NavLinkProps {
    href: string;
    label: string;
    icon?: React.ReactNode;
    items?: Array<{
        href: string;
        label: string;
    }>;
    isMobile?: boolean;
    onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon, items, isMobile = false, onClick }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);

    const handleClick = () => {
        if (items) {
            setIsOpen(!isOpen);
        } else if (onClick) {
            onClick();
        }
    };

    // Base styles for all links
    const baseClasses = "flex items-center transition-colors";

    // Desktop vs Mobile specific styles
    const styleClasses = isMobile
        ? "text-xl py-3 px-4 hover:bg-military-700 rounded-sm w-full justify-between border border-transparent hover:border-olive-700"
        : "text-lg hover:text-olive-500 gap-2";

    // Active state styles
    const activeClasses = isActive
        ? isMobile ? "bg-military-700 text-olive-500 border-olive-700" : "text-olive-500"
        : "";

    return (
        <div className={isMobile ? "w-full" : ""}>
            <div
                className={`${baseClasses} ${styleClasses} ${activeClasses} ${items ? "cursor-pointer" : ""}`}
                onClick={items ? handleClick : undefined}
            >
                {/* If this is a regular link with no children */}
                {!items ? (
                    <Link href={href} className="flex items-center gap-2 w-full" onClick={onClick}>
                        {icon && <span className="text-military-400">{icon}</span>}
                        {label}
                    </Link>
                ) : (
                    <>
            <span className="flex items-center gap-2">
              {icon && <span className="text-military-400">{icon}</span>}
                {label}
            </span>
                        <ChevronDown
                            size={20}
                            className={`transform transition-transform ${isOpen ? "rotate-180" : ""} text-olive-600`}
                        />
                    </>
                )}
            </div>

            {/* Dropdown for items with children */}
            {items && isOpen && (
                <div className={isMobile ? "ml-4 mt-1 space-y-1" : "absolute mt-2 py-2 bg-military-800 rounded-sm shadow-lg min-w-48 border border-olive-800"}>
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={
                                isMobile
                                    ? "block py-2 px-6 hover:bg-military-700 text-lg rounded-sm"
                                    : "block py-2 px-6 hover:bg-military-700 text-md hover:text-olive-500 transition-colors"
                            }
                            onClick={onClick}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

interface NavigationProps {
    isMobile?: boolean;
    onLinkClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMobile = false, onLinkClick }) => {
    const navItems = [
        {
            href: "/items",
            label: "ITEMS",
            links: [
                { href: "/items/weapons", label: "Weapons" },
                { href: "/items/ammo", label: "Ammo" },
                { href: "/items/medicine", label: "Medicine" },
                { href: "/items/food", label: "Food" },
                { href: "/items/junk", label: "Junk" },
            ],
        },
        {
            href: "/hideout",
            label: "HIDEOUT",
            links: [
                { href: "/hideout/zones", label: "Zones" },
                { href: "/hideout/calculator", label: "Calculator" },
                { href: "/hideout/planner", label: "Upgrade Planner" },
            ],
        },
        {
            href: "/maps",
            label: "MAPS",
        },
        {
            href: "/quests",
            label: "QUESTS",
        },
        {
            href: "/guides",
            label: "GUIDES",
            links: [
                { href: "/guides/beginners", label: "Beginner's Guide" },
                { href: "/guides/economy", label: "Economy Guide" },
                { href: "/guides/mechanics", label: "Game Mechanics" },
                { href: "/guides/vr-tips", label: "VR Tips" },
            ],
        },
    ];

    const containerClasses = isMobile
        ? "flex flex-col gap-1 w-full"
        : "flex items-center gap-8";

    return (
        <nav className={containerClasses}>
            {navItems.map((item, index) => (
                <div key={index} className={isMobile ? "" : "relative"}>
                    <NavLink
                        href={item.href}
                        label={item.label}
                        items={item.links}
                        isMobile={isMobile}
                        onClick={onLinkClick}
                    />
                </div>
            ))}
        </nav>
    );
};

export default Navigation;