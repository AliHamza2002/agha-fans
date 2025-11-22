import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type UserRole = 'Admin' | 'StoreBoy' | 'FinalBoy';

export interface User {
	id: string;
	username: string;
	email: string;
	role: UserRole;
}

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<User | null>;
	signup: (username: string, email: string, password: string, role: UserRole) => Promise<User | null>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'fence-ledger-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				return parsed.user || null;
			}
		} catch {}
		return null;
	});

	useEffect(() => {
		if (user) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [user]);

	const login = async (username: string, password: string): Promise<User | null> => {
		try {
			const stored = localStorage.getItem('fence-ledger-users');
			if (stored) {
				const users: (User & { password: string })[] = JSON.parse(stored);
				const foundUser = users.find(u => u.username === username && u.password === password);
				if (foundUser) {
					const { password: _, ...userWithoutPassword } = foundUser;
					setUser(userWithoutPassword);
					return userWithoutPassword;
				}
			}
			return null;
		} catch {
			return null;
		}
	};

	const signup = async (username: string, email: string, password: string, role: UserRole): Promise<User | null> => {
		try {
			const stored = localStorage.getItem('fence-ledger-users');
			const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
			
			// Check if username already exists
			if (users.some(u => u.username === username)) {
				return null;
			}

			const newUser: User & { password: string } = {
				id: crypto.randomUUID(),
				username,
				email,
				password,
				role,
			};

			users.push(newUser);
			localStorage.setItem('fence-ledger-users', JSON.stringify(users));

			const { password: _, ...userWithoutPassword } = newUser;
			setUser(userWithoutPassword);
			return userWithoutPassword;
		} catch {
			return null;
		}
	};

	const logout = () => {
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

