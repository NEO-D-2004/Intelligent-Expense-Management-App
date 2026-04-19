import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { User } from '../types';
import { saveUser, getUser, logout as storageLogout } from '../utils/storage';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true,
    updateUser: () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getUser());
    const [loading, setLoading] = useState(true);

    const updateUser = (updatedUser: User) => {
        saveUser(updatedUser);
        setUser(updatedUser);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const existingUser = getUser();
                // Map Firebase user to our internal User type, preserving existing data if IDs match
                const appUser: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || (existingUser?.id === firebaseUser.uid ? existingUser.email : ''),
                    name: firebaseUser.displayName || (existingUser?.id === firebaseUser.uid ? existingUser.name : 'User'),
                    currency: existingUser?.id === firebaseUser.uid ? existingUser.currency : 'USD',
                    monthlyIncome: existingUser?.id === firebaseUser.uid ? existingUser.monthlyIncome : 0,
                    salaryDay: existingUser?.id === firebaseUser.uid ? existingUser.salaryDay : 1,
                };

                // Save to storage to maintain compatibility with existing utils
                saveUser(appUser);
                setUser(appUser);
            } else {
                storageLogout();
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
