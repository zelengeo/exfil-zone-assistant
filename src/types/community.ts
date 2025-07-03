import React from "react";

export interface Contributor {
    name: string;
    role: 'creator' | 'contributor' | 'supporter' | 'partner';
    component?: React.ReactNode;
    description?: string;
    logo?: string;
    link?: string;
    platform?: 'youtube' | 'twitch' | 'website' | 'github' | 'discord' | 'telegram';
}