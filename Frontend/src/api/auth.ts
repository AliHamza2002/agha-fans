import type { UserRole } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface RegisterUserRequest {
	name: string;
	email: string;
	password: string;
	role: string;
}

export interface RegisterUserResponse {
	user: {
		_id: string;
		name: string;
		email: string;
		role: string;
	};
}

export interface LoginUserRequest {
	email: string;
	password: string;
}

export interface LoginUserResponse {
	user: {
		_id: string;
		name: string;
		email: string;
		role: string;
	};
	token?: string;
}

// Map frontend role to backend role format
export const mapRoleToBackend = (role: UserRole): string => {
	const roleMap: Record<UserRole, string> = {
		'Admin': 'admin',
		'StoreBoy': 'storeBoy',
		'FinalBoy': 'finalBoy'
	};
	return roleMap[role];
};

// Map backend role to frontend role format
export const mapRoleToFrontend = (role: string): UserRole => {
	const roleMap: Record<string, UserRole> = {
		'admin': 'Admin',
		'storeBoy': 'StoreBoy',
		'finalBoy': 'FinalBoy'
	};
	return roleMap[role] || 'StoreBoy';
};

export const registerUser = async (
	name: string,
	email: string,
	password: string,
	role: UserRole
): Promise<RegisterUserResponse> => {
	const response = await fetch(`${API_BASE_URL}/users/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			name,
			email,
			password,
			role: mapRoleToBackend(role),
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Registration failed');
	}

	return response.json();
};

export const loginUser = async (
	email: string,
	password: string
): Promise<LoginUserResponse> => {
	const response = await fetch(`${API_BASE_URL}/users/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email,
			password,
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Login failed');
	}

	return response.json();
};
