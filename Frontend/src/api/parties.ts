const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://agha-fans-backend.vercel.app';

// *** FEATURE: Party Item interface ***
export interface PartyItem {
	_id?: string;
	itemName: string;
	itemPrice: number;
}

export interface Party {
	_id: string;
	name: string;
	type: 'Buyer' | 'Supplier';
	contact?: string;
	items?: PartyItem[]; // *** FEATURE: Items array ***
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePartyRequest {
	name: string;
	type: 'Buyer' | 'Supplier';
	contact?: string;
	items: PartyItem[]; // *** FEATURE: Items required for creation ***
}

export interface UpdatePartyRequest extends Partial<CreatePartyRequest> { }

// Helper to get user email from localStorage
const getUserEmail = (): string | null => {
	try {
		const authData = localStorage.getItem('fence-ledger-auth');
		if (authData) {
			const parsed = JSON.parse(authData);
			return parsed.user?.email || null;
		}
	} catch { }
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

// GET all parties (with optional type filter)
export const getParties = async (type?: string): Promise<{ parties: Party[] }> => {
	const url = new URL(`${API_BASE_URL}/api/parties`);
	if (type) {
		url.searchParams.append('type', type);
	}

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch parties');
	}

	return response.json();
};

// GET single party by ID
export const getPartyById = async (id: string): Promise<{ party: Party }> => {
	const response = await fetch(`${API_BASE_URL}/api/parties/${id}`, {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch party');
	}

	return response.json();
};

// CREATE new party
export const createParty = async (data: CreatePartyRequest): Promise<{ party: Party }> => {
	const response = await fetch(`${API_BASE_URL}/api/parties`, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to create party');
	}

	return response.json();
};

// UPDATE party
export const updateParty = async (id: string, data: UpdatePartyRequest): Promise<{ party: Party }> => {
	const response = await fetch(`${API_BASE_URL}/api/parties/${id}`, {
		method: 'PUT',
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to update party');
	}

	return response.json();
};

// DELETE party
export const deleteParty = async (id: string): Promise<{ message: string }> => {
	const response = await fetch(`${API_BASE_URL}/api/parties/${id}`, {
		method: 'DELETE',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to delete party');
	}

	return response.json();
};

// *** FEATURE: GET items for a specific party ***
export const getPartyItems = async (partyId: string): Promise<{ items: PartyItem[] }> => {
	const response = await fetch(`${API_BASE_URL}/api/parties/${partyId}/items`, {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch party items');
	}

	return response.json();
};

