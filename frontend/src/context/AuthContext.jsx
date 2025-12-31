import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const data = await authApi.me();
            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const data = await authApi.me();
            setUser(data.user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const signin = async (email, password) => {
        const data = await authApi.signin(email, password);
        setUser(data.user);
        return data.user;
    };

    const signup = async (email, password, name) => {
        const data = await authApi.signup(email, password, name);
        setUser(data.user);
        return data.user;
    };

    const signout = async () => {
        await authApi.signout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signin, signup, signout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
