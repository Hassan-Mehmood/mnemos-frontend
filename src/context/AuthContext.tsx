import React, { createContext, useContext, useEffect, useState } from 'react';

// You might expand the user type based on your needs
interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, user?: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUserFromToken = (token: string | null): User | null => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return (
                        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    );
                })
                .join(''),
        );

        const payload = JSON.parse(jsonPayload);
        return {
            id: payload.sub,
            email: payload.email || '',
            name: payload.name || '',
        };
    } catch (e) {
        console.error('Failed to parse token', e);
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('access_token'),
    );
    const [user, setUser] = useState<User | null>(
        getUserFromToken(localStorage.getItem('access_token')),
    );

    const login = (newToken: string, newUser?: User) => {
        setToken(newToken);
        const decoded = getUserFromToken(newToken);
        if (newUser) {
            setUser({ ...newUser, id: decoded?.id || newUser.id });
        } else {
            setUser(decoded);
        }
        localStorage.setItem('access_token', newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{ token, user, login, logout, isAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
