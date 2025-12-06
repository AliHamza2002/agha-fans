const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Material {
	_id: string;
	name: string;
	category: 'Raw' | 'Semi-Finished' | 'Final';
	unit: 'kg' | 'pcs';
	quantity: number;
	unitPrice?: number;
	description?: string;
	lowStockThreshold?: number;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateMaterialRequest {
	name: string;
	category: 'Raw' | 'Semi-Finished' | 'Final';
	unit: 'kg' | 'pcs';
	quantity?: number;
	unitPrice?: number;
	description?: string;
	lowStockThreshold?: number;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {}

// Helper to get user email from localStorage
const getUserEmail = (): string | null => {
	try {
		const authData = localStorage.getItem('fence-ledger-auth');
		if (authData) {
			const parsed = JSON.parse(authData);
			return parsed.user?.email || null;
		}
	} catch {}
	return null;
};

// Helper to create headers with authentication
const getHeaders = (): HeadersInit => {
	const userEmail = getUserEmail();
	return {
		'Content-Type': 'application/json',
		...(userEmail && { 'x-user-email': userEmail })
	};
};

// GET all materials (with optional category filter)
export const getMaterials = async (category?: string): Promise<{ materials: Material[] }> => {
	const url = new URL(`${API_BASE_URL}/api/materials`);
	if (category) {
		url.searchParams.append('category', category);
	}

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch materials');
	}

	return response.json();
};

// GET single material by ID
export const getMaterialById = async (id: string): Promise<{ material: Material }> => {
	const response = await fetch(`${API_BASE_URL}/api/materials/${id}`, {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch material');
	}

	return response.json();
};

// CREATE new material
export const createMaterial = async (data: CreateMaterialRequest): Promise<{ material: Material }> => {
	const response = await fetch(`${API_BASE_URL}/api/materials`, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to create material');
	}

	return response.json();
};

// UPDATE material
export const updateMaterial = async (id: string, data: UpdateMaterialRequest): Promise<{ material: Material }> => {
	const response = await fetch(`${API_BASE_URL}/api/materials/${id}`, {
		method: 'PUT',
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to update material');
	}

	return response.json();
};

// DELETE material
export const deleteMaterial = async (id: string): Promise<{ message: string }> => {
	const response = await fetch(`${API_BASE_URL}/api/materials/${id}`, {
		method: 'DELETE',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to delete material');
	}

	return response.json();
};
