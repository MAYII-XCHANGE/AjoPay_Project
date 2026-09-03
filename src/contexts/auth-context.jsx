/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { mockApi } from "../api/mock-service";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("ajopay-user");
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);
    const save = (next) => {
        setUser(next);
        if (next)
            localStorage.setItem("ajopay-user", JSON.stringify(next));
        else
            localStorage.removeItem("ajopay-user");
    };
    const value = useMemo(() => ({
        user,
        loading,
        login: async (email, password) => {
            setLoading(true);
            try {
                save(await mockApi.login(email, password));
            }
            finally {
                setLoading(false);
            }
        },
        register: async (name, email, _password) => {
            void _password;
            setLoading(true);
            try {
                return await mockApi.register(name, email);
            }
            finally {
                setLoading(false);
            }
        },
        resendRegistrationOtp: (email) => mockApi.requestRegistrationOtp(email),
        verifyRegistrationOtp: async (email, otp) => {
            const verifiedUser = await mockApi.verifyRegistrationOtp(email, otp);
            save(verifiedUser);
            return verifiedUser;
        },
        requestPasswordResetOtp: (email) => mockApi.requestPasswordResetOtp(email),
        confirmPasswordResetOtp: (email, otp) => mockApi.confirmPasswordResetOtp(email, otp),
        resetPassword: (email, resetToken, password) => mockApi.resetPassword(email, resetToken, password),
        updateProfile: async (updates) => {
            const updated = await mockApi.updateProfile({ ...user, ...updates });
            save(updated);
            return updated;
        },
        saveBankAccount: async (account) => {
            const result = await mockApi.saveBankAccount(user, account);
            save(result.user);
            return result.account;
        },
        setDefaultBankAccount: async (id) => {
            const updated = await mockApi.setDefaultBankAccount(user, id);
            save(updated);
            return updated;
        },
        removeBankAccount: async (id) => {
            const updated = await mockApi.removeBankAccount(user, id);
            save(updated);
            return updated;
        },
        updateNotificationPreferences: async (preferences) => {
            const updated = await mockApi.updateNotificationPreferences(user, preferences);
            save(updated);
            return updated;
        },
        logout: () => save(null),
        enterDemo: (admin = false) => save({ id: admin ? "admin-1" : "user-1", name: admin ? "AjoPay Admin" : "Mayowa Adeyemi", email: admin ? "admin@ajopay.ng" : "mayowa@example.com", phone: "+234 803 123 4567", role: admin ? "ADMIN" : "USER", rating: 4.8, completedCycles: 12, followersCount: 248, joinedAt: "2025-03-18", dateOfBirth: "", address: "", city: "Lagos", state: "Lagos", country: "Nigeria", accountStatus: "ACTIVE", emailVerified: true, phoneVerified: true, identityVerified: true, twoFactorEnabled: false, preferences: { contributionReminders: true, payoutUpdates: true, groupNotifications: true, productNews: false }, bankAccounts: [{ id: "bank-1", bankCode: "058", bankName: "GTBank", accountNumber: "0000008842", accountName: admin ? "AjoPay Admin" : "Mayowa Adeyemi", isDefault: true, verified: true }] }),
    }), [user, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error("useAuth must be used within AuthProvider");
    return value;
}
