/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAccessDenied, onSessionExpired, refreshSession } from "../api/client";
import { clearTokens, getRefreshToken } from "../api/token-store";
import { authService } from "../services/auth-service";
import { useQueryClient } from "@tanstack/react-query";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionMessage, setSessionMessage] = useState("");

    const loadProfile = useCallback(async (session) => {
        const profile = await authService.profile();
        const tokenRole = session?.tokenRole || session?.role;
        const safeSession = Object.fromEntries(
            Object.entries(session || {}).filter(([key]) => !["accessToken", "refreshToken"].includes(key)),
        );
        const next = {
            ...safeSession,
            ...profile,
            name: profile.name || session?.name || [profile.firstName, profile.lastName].filter(Boolean).join(" "),
            role: profile.role || tokenRole,
            tokenRole,
        };
        setUser(next);
        return next;
    }, []);

    useEffect(() => onSessionExpired(() => {
        queryClient.clear();
        setUser(null);
        setLoading(false);
        setSessionMessage("Your session expired. Please sign in again.");
    }), [queryClient]);

    useEffect(() => onAccessDenied(() => {
        authService.profile().then((profile) => {
            setUser((current) => current ? {
                ...current,
                ...profile,
                name: profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || current.name,
            } : current);
        }).catch(() => undefined);
    }), [loadProfile]);

    useEffect(() => {
        let active = true;

        const restoreSession = async () => {
            if (!getRefreshToken()) {
                if (active) setLoading(false);
                return;
            }

            try {
                const session = await refreshSession();
                if (!active) return;
                await loadProfile(session);
                if (active) setSessionMessage("");
            } catch {
                clearTokens();
                if (active) {
                    queryClient.clear();
                    setUser(null);
                    setSessionMessage("Your session has ended. Please sign in again.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        restoreSession();
        return () => { active = false; };
    }, [loadProfile, queryClient]);
    const value = useMemo(() => ({
        user,
        loading,
        sessionMessage,
        clearSessionMessage: () => setSessionMessage(""),
        login: async (email, password) => {
            setLoading(true);
            try {
                const session = await authService.login({ email: email.trim(), password });
                setSessionMessage("");
                return await loadProfile(session);
            }
            finally {
                setLoading(false);
            }
        },
        register: async (name, email, password) => {
            setLoading(true);
            try {
                return await authService.register({ name, email: email.trim(), password });
            }
            finally {
                setLoading(false);
            }
        },
        resendRegistrationOtp: (email) => authService.resendRegistrationOtp(email),
        verifyRegistrationOtp: (email, otp) => authService.verifyRegistrationOtp(email, otp),
        requestPasswordResetOtp: (email) => authService.requestPasswordResetOtp(email),
        resendPasswordResetOtp: (email) => authService.resendPasswordResetOtp(email),
        confirmPasswordResetOtp: (email, otp) => authService.confirmPasswordResetOtp(email, otp),
        resetPassword: (email, password) => authService.resetPassword(email, password),
        changePassword: (currentPassword, newPassword) => authService.changePassword(currentPassword, newPassword),
        updateProfile: async (updates) => {
            const updated = await authService.updateProfile(updates);
            setUser((current) => ({
                ...current,
                ...updated,
                name: updated.name || [updated.firstName, updated.lastName].filter(Boolean).join(" ") || current?.name,
                avatarUrl: updated.avatarUrl || updated.profileImageUrl || current?.avatarUrl,
            }));
            return updated;
        },
        refreshProfile: () => loadProfile(user),
        logout: async () => {
            setLoading(true);
            try { await authService.logout(); }
            finally { queryClient.clear(); setUser(null); setLoading(false); }
        },
    }), [user, loading, sessionMessage, queryClient, loadProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error("useAuth must be used within AuthProvider");
    return value;
}
