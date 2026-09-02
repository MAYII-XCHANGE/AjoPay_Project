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
                save(await mockApi.register(name, email));
            }
            finally {
                setLoading(false);
            }
        },
        logout: () => save(null),
        enterDemo: (admin = false) => save({ id: admin ? "admin-1" : "user-1", name: admin ? "AjoPay Admin" : "Mayowa Adeyemi", email: admin ? "admin@ajopay.ng" : "mayowa@example.com", phone: "+234 803 123 4567", role: admin ? "ADMIN" : "USER", rating: 4.8, completedCycles: 12 }),
    }), [user, loading]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error("useAuth must be used within AuthProvider");
    return value;
}
