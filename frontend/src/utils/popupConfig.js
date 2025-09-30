/**
 * Configuration for the random popup feature
 */
export const POPUP_CONFIG = {
    // Timing configuration (in milliseconds)
    INITIAL_DELAY: 15000,  // 15 seconds after login before popup appears
    LOGGED_IN_ONLY: true,  // Only show popup when user is logged in

    // Feature toggles
    ENABLED: true,         // Set to false to disable popup globally

    // Display configuration
    SHOW_ONCE_PER_SESSION: true, // Show only once per login session
    MAX_POPUPS_PER_SESSION: 1,   // Maximum 1 popup per session

    // Storage keys for remembering user preferences
    STORAGE_KEY: 'rolevault_popup_prefs',
    DISABLED_UNTIL_KEY: 'rolevault_popup_disabled_until'
};

/**
 * Get user preferences for popup display
 */
export const getPopupPreferences = () => {
    try {
        const stored = localStorage.getItem(POPUP_CONFIG.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            showCount: 0,
            disabledUntil: null,
            lastShown: null,
            dismissedVariants: [],
            currentVariant: 0,
            dismissCount: 0
        };
    } catch {
        return {
            showCount: 0,
            disabledUntil: null,
            lastShown: null,
            dismissedVariants: [],
            currentVariant: 0,
            dismissCount: 0
        };
    }
};

/**
 * Save user preferences for popup display
 */
export const savePopupPreferences = (preferences) => {
    try {
        localStorage.setItem(POPUP_CONFIG.STORAGE_KEY, JSON.stringify(preferences));
    } catch {
        // Silently fail if localStorage is not available
    }
};

/**
 * Check if popups should be shown based on user preferences and session limits
 */
export const shouldShowPopup = () => {
    const prefs = getPopupPreferences();
    const now = Date.now();

    // Check if popups are disabled globally
    if (!POPUP_CONFIG.ENABLED) {
        return false;
    }

    // Check if user has temporarily disabled popups
    if (prefs.disabledUntil && now < prefs.disabledUntil) {
        return false;
    }

    // Check session limit
    if (prefs.showCount >= POPUP_CONFIG.MAX_POPUPS_PER_SESSION) {
        return false;
    }

    return true;
};

/**
 * Record that a popup was shown
 */
export const recordPopupShown = () => {
    const prefs = getPopupPreferences();
    prefs.showCount += 1;
    prefs.lastShown = Date.now();
    savePopupPreferences(prefs);
};

/**
 * Record that a new popup variant was shown (only count new variants, not repeats)
 */
export const recordNewVariantShown = () => {
    const prefs = getPopupPreferences();
    prefs.showCount += 1;
    prefs.lastShown = Date.now();
    savePopupPreferences(prefs);
};

/**
 * Disable popups for a specified duration
 */
export const disablePopupsFor = (durationMs) => {
    const prefs = getPopupPreferences();
    prefs.disabledUntil = Date.now() + durationMs;
    savePopupPreferences(prefs);
};

/**
 * Reset popup preferences (for testing)
 */
export const resetPopupPreferences = () => {
    try {
        localStorage.removeItem(POPUP_CONFIG.STORAGE_KEY);
    } catch {
        // Silently fail if localStorage is not available
    }
};

/**
 * Reset only session count (for testing)
 */
export const resetSessionCount = () => {
    const prefs = getPopupPreferences();
    prefs.showCount = 0;
    savePopupPreferences(prefs);
};

/**
 * Mark a popup variant as dismissed (Got it clicked)
 */
export const markVariantAsDismissed = (variantIndex) => {
    const prefs = getPopupPreferences();
    if (!prefs.dismissedVariants) {
        prefs.dismissedVariants = [];
    }
    if (!prefs.dismissedVariants.includes(variantIndex)) {
        prefs.dismissedVariants.push(variantIndex);
        savePopupPreferences(prefs);
    }
};

/**
 * Get available popup variants (not dismissed)
 */
export const getAvailableVariants = (totalVariants) => {
    const prefs = getPopupPreferences();
    const dismissedVariants = prefs.dismissedVariants || [];
    const availableVariants = [];

    for (let i = 0; i < totalVariants; i++) {
        if (!dismissedVariants.includes(i)) {
            availableVariants.push(i);
        }
    }

    return availableVariants;
};

/**
 * Get the current popup variant that should be shown
 */
export const getCurrentPopupVariant = (totalVariants) => {
    const prefs = getPopupPreferences();
    return prefs.currentVariant !== undefined ? prefs.currentVariant : 0;
};

/**
 * Set the current popup variant
 */
export const setCurrentPopupVariant = (variantIndex) => {
    const prefs = getPopupPreferences();
    prefs.currentVariant = variantIndex;
    savePopupPreferences(prefs);
};

/**
 * Get the current dismiss count (for incremental delays)
 */
export const getDismissCount = () => {
    const prefs = getPopupPreferences();
    return prefs.dismissCount || 0;
};

/**
 * Increment dismiss count and return new count
 */
export const incrementDismissCount = () => {
    const prefs = getPopupPreferences();
    prefs.dismissCount = (prefs.dismissCount || 0) + 1;
    savePopupPreferences(prefs);
    return prefs.dismissCount;
};