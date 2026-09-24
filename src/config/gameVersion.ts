// Game version configuration
export const GAME_VERSION = {
    current: "1.7.0.0", // ContractorsSettings.VersionNum, published by
    // exfil-zone-assistant-extraction: node tools/publishGameVersion.js
    lastWipe: "1.7.0.0", // Editorial - not extractable; move it with --wipe on a season reset
    wipeId: "1.7.0.0", // Stable across patches; change only for an intentional progress reset
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