import { useState, useEffect, useCallback } from 'react';
import {
    POPUP_CONFIG,
    shouldShowPopup,
    recordPopupShown
} from '../utils/popupConfig';

/**
 * Custom hook for managing single welcome popup
 * Behavior:
 * - Shows once after 15 seconds of login
 * - Only shows when user is logged in
 * - Can be dismissed permanently
 */
export const useRandomPopup = ({
    enabled = POPUP_CONFIG.ENABLED,
    isLoggedIn = false
} = {}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const [hasShownPopup, setHasShownPopup] = useState(false);

    // Close popup (X button, backdrop, escape)
    const close = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(false);
    }, [timeoutId]);

    // Dismiss popup with "Got it" - permanently dismiss
    const dismiss = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(false);
        recordPopupShown(); // Mark as permanently dismissed
        setHasShownPopup(true);
    }, [timeoutId]);

    const disable = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsOpen(false);
    }, [timeoutId]);

    const showNow = useCallback(() => {
        if (enabled && isLoggedIn && shouldShowPopup() && !hasShownPopup) {
            setIsOpen(true);
        }
    }, [enabled, isLoggedIn, hasShownPopup]);

    // Schedule popup after login
    useEffect(() => {
        if (!enabled || !isLoggedIn || hasShownPopup || !shouldShowPopup()) {
            return;
        }

        // Schedule popup to show after 15 seconds of login
        const id = setTimeout(() => {
            if (enabled && isLoggedIn && shouldShowPopup() && !hasShownPopup) {
                setIsOpen(true);
                setHasShownPopup(true);
            }
        }, POPUP_CONFIG.INITIAL_DELAY);

        setTimeoutId(id);

        return () => {
            clearTimeout(id);
        };
    }, [enabled, isLoggedIn, hasShownPopup]);

    // Cleanup timeoutId on unmount
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
        showNow,
        isEnabled: enabled
    };
};