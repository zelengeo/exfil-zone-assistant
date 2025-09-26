// Game version configuration
export const GAME_VERSION = {
    current: "1.14.0.2", // Update this with each app release
    lastWipe: "1.14.0.0", // Update this when a new wipe happens
};

// Helper function for version comparison
export const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < 4; i++) {
        if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
        if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
    }
    return 0;
};


// Update stored version
export const                                                                            getVersion = () => {
    return GAME_VERSION.current
};