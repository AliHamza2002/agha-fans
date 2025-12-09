const API_BASE_URL = import.meta.env.VITE_API_URL ;

export interface Transaction {
	_id: string;
	date: string;
	billNo: string;
	materialId?: string;
	materialName?: string;
	category?: 'Raw' | 'Semi-Finished' | 'Final';
	type: 'Purchase' | 'Sale' | 'Payment' | 'Receipt';
	quantity: number;
	unitPrice: number;
	debit: number;
	credit: number;
	total: number;
	partyId?: string;
	partyName?: string;
	notes?: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTransactionRequest {
	date?: string;
	materialId?: string;
	type: 'Purchase' | 'Sale' | 'Payment' | 'Receipt';
	quantity: number;
	unitPrice: number;
	partyId?: string;
	notes?: string;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

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

// GET all transactions (with optional filters)
export const getTransactions = async (filters?: {
	partyId?: string;
	type?: string;
	startDate?: string;
	endDate?: string;
}): Promise<{ transactions: Transaction[] }> => {
	const url = new URL(`${API_BASE_URL}/api/transactions`);
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value) url.searchParams.append(key, value);
		});
	}

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch transactions');
	}

	return response.json();
};

// GET single transaction by ID
export const getTransactionById = async (id: string): Promise<{ transaction: Transaction }> => {
	const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
		method: 'GET',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch transaction');
	}

	return response.json();
};

// CREATE new transaction
export const createTransaction = async (data: CreateTransactionRequest): Promise<{ transaction: Transaction }> => {
	const response = await fetch(`${API_BASE_URL}/api/transactions`, {
		method: 'POST',
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to create transaction');
	}

	return response.json();
};

// UPDATE transaction
export const updateTransaction = async (id: string, data: UpdateTransactionRequest): Promise<{ transaction: Transaction }> => {
	const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
		method: 'PUT',
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to update transaction');
	}

	return response.json();
};

// DELETE transaction
export const deleteTransaction = async (id: string): Promise<{ message: string }> => {
	const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
		method: 'DELETE',
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to delete transaction');
	}

	return response.json();
};

