import { useState, useEffect, useCallback } from 'react';
import {
    POPUP_CONFIG,
    shouldShowPopup,
    recordNewVariantShown,
    disablePopupsFor,
    getAvailableVariants,
    getCurrentPopupVariant,
    setCurrentPopupVariant,
    getDismissCount,
    incrementDismissCount
} from '../utils/popupConfig';

/**
 * Custom hook for managing random popup behavior
 * New behavior:
 * - Same popup repeats every 5 seconds until user clicks "Got it"
 * - Close/backdrop/refresh keeps same popup coming back
 * - "Got it" dismisses variant and moves to next with incremental delay (5s, 10s, 15s...)
 */
export const useRandomPopup = ({
    enabled = POPUP_CONFIG.ENABLED
} = {}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    // Schedule the same popup to repeat every 5 seconds until dismissed
    const scheduleRepeatPopup = useCallback(() => {
        if (!enabled || !shouldShowPopup()) {
            return;
        }

        // Check if there are any available variants
        const availableVariants = getAvailableVariants(4);
        if (availableVariants.length === 0) {
            return; // No variants available, stop scheduling
        }

        const id = setTimeout(() => {
            if (shouldShowPopup()) {
                setIsOpen(true);
                // Don't record popup shown for repeating same popup
            }
        }, 5000); // Always 5 seconds for repeating same popup

        setTimeoutId(id);
    }, [enabled]);

    // Schedule next different popup with incremental delay
    const scheduleNextVariant = useCallback(() => {
        if (!enabled || !shouldShowPopup()) {
            return;
        }

        const availableVariants = getAvailableVariants(4);
        if (availableVariants.length === 0) {
            return; // No variants available, stop scheduling
        }

        // Set next available variant
        const currentVariant = getCurrentPopupVariant(4);
        const nextVariantIndex = availableVariants.find(v => v !== currentVariant) || availableVariants[0];
        setCurrentPopupVariant(nextVariantIndex);

        // Calculate incremental delay: 5s, 10s, 15s, 20s...
        const dismissCount = getDismissCount();
        const delay = 5000 + (dismissCount * 5000); // 5s + (count * 5s)

        const id = setTimeout(() => {
            if (shouldShowPopup()) {
                setIsOpen(true);
                recordNewVariantShown(); // Record only when showing new variant
            }
        }, delay);

        setTimeoutId(id);
    }, [enabled]); // Close popup (X button, backdrop, escape) - same popup will repeat
    const close = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(false);
        // Schedule the same popup to appear again in 5 seconds
        scheduleRepeatPopup();
    }, [timeoutId, scheduleRepeatPopup]);

    // Dismiss popup with "Got it" - move to next variant with incremental delay
    const dismiss = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(false);

        // Increment dismiss count for incremental delays
        incrementDismissCount();

        // Schedule next variant with incremental delay
        scheduleNextVariant();
    }, [timeoutId, scheduleNextVariant]);

    const disable = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(false);
    }, [timeoutId]);

    const snooze = useCallback((durationMs = 3600000) => { // Default 1 hour
        disablePopupsFor(durationMs);
        setIsOpen(false);
        disable();
    }, [disable]);

    const enable = useCallback(() => {
        scheduleRepeatPopup();
    }, [scheduleRepeatPopup]);

    const showNow = useCallback(() => {
        if (shouldShowPopup()) {
            // Check if there are any available variants
            const availableVariants = getAvailableVariants(4);
            if (availableVariants.length > 0) {
                setIsOpen(true);
                recordNewVariantShown(); // Record as new variant when manually triggered
            }
        }
    }, []);

    // Initial popup scheduling
    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Start with initial delay
        const initialTimeoutId = setTimeout(() => {
            if (shouldShowPopup()) {
                const availableVariants = getAvailableVariants(4);
                if (availableVariants.length > 0) {
                    // Set first available variant as current
                    setCurrentPopupVariant(availableVariants[0]);
                    setIsOpen(true);
                    recordNewVariantShown(); // Record initial variant as new
                }
            }
        }, 5000);

        return () => {
            clearTimeout(initialTimeoutId);
        };
    }, [enabled]);    // Cleanup timeoutId on unmount
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    return {
        isOpen,
        close,
        dismiss,
        disable,
        enable,
        snooze,
        showNow,
        isEnabled: enabled
    };
};