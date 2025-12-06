import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { registerUser, loginUser as loginUserAPI, mapRoleToFrontend } from '../api/auth';

export type UserRole = 'Admin' | 'StoreBoy' | 'FinalBoy';

export interface User {
	id: string;
	username: string;
	email: string;
	role: UserRole;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<User | null>;
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

	// *** BROWSER CLOSE WARNING: Warn user they'll be logged out ***
	// Note: Browser's beforeunload dialog cannot be fully customized
	// The message shown is controlled by the browser
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (user) {
				// Modern browsers ignore custom messages and show their own
				// This will trigger the browser's standard "Leave site?" dialog
				e.preventDefault();
				e.returnValue = ''; // Empty string is required for Chrome
			}
		};

		// Add event listener
		window.addEventListener('beforeunload', handleBeforeUnload);

		// Cleanup
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [user]);

	const login = async (email: string, password: string): Promise<User | null> => {
		try {
			// Call the backend API to login the user
			const response = await loginUserAPI(email, password);
			
			// Map the backend response to frontend User format
			const loggedInUser: User = {
				id: response.user._id,
				username: response.user.name,
				email: response.user.email,
				role: mapRoleToFrontend(response.user.role),
			};

			setUser(loggedInUser);
			return loggedInUser;
		} catch (error) {
			console.error('Login error:', error);
			return null;
		}
	};

	const signup = async (username: string, email: string, password: string, role: UserRole): Promise<User | null> => {
		try {
			// Call the backend API to register the user
			const response = await registerUser(username, email, password, role);
			
			// Map the backend response to frontend User format
			const newUser: User = {
				id: response.user._id,
				username: response.user.name,
				email: response.user.email,
				role: mapRoleToFrontend(response.user.role),
			};

			setUser(newUser);
			return newUser;
		} catch (error) {
			console.error('Signup error:', error);
			return null;
		}
	};

	// *** LOGOUT: Clear all user data and localStorage ***
	const logout = () => {
		// Clear user state
		setUser(null);
		
		// Clear all localStorage data
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem('fence-ledger-state-v1'); // Clear store data
		
		console.log('User logged out successfully');
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

