export const community = {
    orbb: {
        name: 'Orbb',
        role: 'creator',
        description: 'Informational and informative content with a focus on VR games!',
        link: 'https://www.youtube.com/@Orbb_',
        logo: '/images/community/orbb_logo.webp',
        platform: 'youtube'
    },
    radFoxVR: {
        name: 'RadFox VR',
        role: 'creator',
        description: 'Hi :3\n' +
            'I\'m a girl from Russia who loves VR! \n' +
            'Here on youtube I upload good games, funny moments, tutorials aaand some other stuff.',
        link: 'https://www.youtube.com/@RadFoxVRuniversity',
        logo: '/images/community/radFoxVR_logo.webp',
        platform: 'youtube'
    },
    plumberKarl: {
        name: 'PlumberKarl',
        role: 'creator',
        description: 'I am a full time self-employed plumber/gasfitter. I play a lot of shooters, adventure and puzzle like games; any VR as well.',
        link: 'https://www.twitch.tv/plumberkarl',
        platform: 'twitch'
    }
} as const;

export const getRoleConfig = (role: string) => {
    switch (role) {
        case 'supporter':
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