import { create } from 'zustand';

export type UnitType = 'kg' | 'pcs';
export type MaterialCategory = 'Raw' | 'Semi-Finished' | 'Final';
export type TransactionType = 'Purchase' | 'Sale' | 'Payment' | 'Receipt';
export type PartyType = 'Buyer' | 'Supplier';

export interface Material {
	id: string;
	name: string;
	category: MaterialCategory;
	unit: UnitType;
	quantity: number;
	unitPrice?: number;
	description?: string;
	lowStockThreshold?: number;
}

export interface Party {
	id: string;
	name: string;
	type: PartyType;
	contact?: string;
}

export interface Transaction {
	id: string;
	date: string; // ISO
	billNo: string; // Auto-generated unique bill number
	materialId?: string;
	materialName?: string;
	category?: MaterialCategory;
	type: TransactionType;
	quantity: number;
	unitPrice: number;
	debit: number; // Increases outstanding balance
	credit: number; // Decreases outstanding balance
	total: number; // Running balance
	partyId?: string;
	partyName?: string;
	notes?: string;
}

export interface StoreState {
	materials: Material[];
	parties: Party[];
	transactions: Transaction[];

	// material ops
	addMaterial: (m: Omit<Material, 'id'>) => void;
	updateMaterial: (id: string, m: Partial<Omit<Material, 'id'>>) => void;
	removeMaterial: (id: string) => void;

	// party ops
	addParty: (p: Omit<Party, 'id'>) => void;
	updateParty: (id: string, p: Partial<Omit<Party, 'id'>>) => void;
	removeParty: (id: string) => void;

	// transactions
	addTransaction: (t: Omit<Transaction, 'id' | 'materialName' | 'category' | 'billNo' | 'debit' | 'credit' | 'total'>) => void;
	updateTransaction: (id: string, t: Partial<Omit<Transaction, 'id'>>) => void;
	removeTransaction: (id: string) => void;

	// computed helpers
	getMaterialById: (id: string) => Material | undefined;
	getPartyById: (id: string) => Party | undefined;
	getTotals: () => { totalPurchases: number; totalSales: number; stockValue: number; profit: number };
}

const STORAGE_KEY = 'fence-ledger-state-v1';

// Generate unique bill number (client-side, per session)
let billNumberCounter = 1;
function generateBillNo(): string {
	const timestamp = Date.now();
	const counter = billNumberCounter++;
	return `BILL-${timestamp}-${counter}`;
}

function persist(state: StoreState) {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				materials: state.materials,
				parties: state.parties,
				transactions: state.transactions,
			}),
		);
	} catch {}
}

// Generate realistic dummy data for demonstration
function generateDummyData(): Pick<StoreState, 'materials' | 'parties' | 'transactions'> {
	const now = new Date();
	const materials: Material[] = [
		// Raw Materials
		{ id: 'm1', name: 'Steel Rods (8mm)', category: 'Raw', unit: 'kg', quantity: 2500, unitPrice: 85, description: 'High-grade steel rods for fence framework', lowStockThreshold: 500 },
		{ id: 'm2', name: 'Steel Rods (12mm)', category: 'Raw', unit: 'kg', quantity: 1800, unitPrice: 92, description: 'Thicker steel rods for main posts', lowStockThreshold: 400 },
		{ id: 'm3', name: 'Galvanized Wire Mesh', category: 'Raw', unit: 'kg', quantity: 3200, unitPrice: 120, description: 'Rust-resistant wire mesh for panels', lowStockThreshold: 600 },
		{ id: 'm4', name: 'Concrete Mix', category: 'Raw', unit: 'kg', quantity: 5000, unitPrice: 8, description: 'Ready-mix concrete for post foundations', lowStockThreshold: 1000 },
		{ id: 'm5', name: 'PVC Coating Material', category: 'Raw', unit: 'kg', quantity: 450, unitPrice: 180, description: 'PVC coating for weather protection', lowStockThreshold: 100 },
		{ id: 'm6', name: 'Welding Electrodes', category: 'Raw', unit: 'pcs', quantity: 2500, unitPrice: 12, description: 'Stainless steel welding electrodes', lowStockThreshold: 500 },
		
		// Semi-Finished Materials
		{ id: 'm7', name: 'Fence Panels (Standard)', category: 'Semi-Finished', unit: 'pcs', quantity: 45, unitPrice: 1250, description: 'Standard 6ft x 4ft fence panels', lowStockThreshold: 10 },
		{ id: 'm8', name: 'Fence Panels (Premium)', category: 'Semi-Finished', unit: 'pcs', quantity: 28, unitPrice: 1850, description: 'Premium 6ft x 4ft panels with decorative top', lowStockThreshold: 8 },
		{ id: 'm9', name: 'Gate Frames', category: 'Semi-Finished', unit: 'pcs', quantity: 15, unitPrice: 2200, description: 'Welded gate frames ready for installation', lowStockThreshold: 5 },
		{ id: 'm10', name: 'Post Caps', category: 'Semi-Finished', unit: 'pcs', quantity: 120, unitPrice: 45, description: 'Decorative post caps for finishing', lowStockThreshold: 30 },
		{ id: 'm11', name: 'Hinges & Latches Set', category: 'Semi-Finished', unit: 'pcs', quantity: 35, unitPrice: 280, description: 'Complete hardware set for gates', lowStockThreshold: 10 },
		
		// Final Products
		{ id: 'm12', name: 'Residential Fence (50m)', category: 'Final', unit: 'pcs', quantity: 8, unitPrice: 45000, description: 'Complete residential fence installation kit', lowStockThreshold: 2 },
		{ id: 'm13', name: 'Commercial Fence (100m)', category: 'Final', unit: 'pcs', quantity: 5, unitPrice: 95000, description: 'Heavy-duty commercial fence system', lowStockThreshold: 2 },
		{ id: 'm14', name: 'Security Gate (Single)', category: 'Final', unit: 'pcs', quantity: 12, unitPrice: 18500, description: 'Single leaf security gate with lock', lowStockThreshold: 3 },
		{ id: 'm15', name: 'Security Gate (Double)', category: 'Final', unit: 'pcs', quantity: 6, unitPrice: 32000, description: 'Double leaf security gate system', lowStockThreshold: 2 },
		{ id: 'm16', name: 'Garden Fence Kit', category: 'Final', unit: 'pcs', quantity: 18, unitPrice: 12500, description: 'Decorative garden fence with posts', lowStockThreshold: 5 },
	];

	const parties: Party[] = [
		{ id: 'p1', name: 'Metro Steel Suppliers', type: 'Supplier', contact: '+91 98765 43210' },
		{ id: 'p2', name: 'ABC Hardware Mart', type: 'Supplier', contact: '+91 98765 43211' },
		{ id: 'p3', name: 'Prime Construction Co.', type: 'Buyer', contact: '+91 98765 43212' },
		{ id: 'p4', name: 'Green Valley Builders', type: 'Buyer', contact: '+91 98765 43213' },
		{ id: 'p5', name: 'City Infrastructure Ltd.', type: 'Buyer', contact: '+91 98765 43214' },
		{ id: 'p6', name: 'Sharma Enterprises', type: 'Buyer', contact: '+91 98765 43215' },
		{ id: 'p7', name: 'Global Wire Industries', type: 'Supplier', contact: '+91 98765 43216' },
		{ id: 'p8', name: 'Modern Homes Pvt. Ltd.', type: 'Buyer', contact: '+91 98765 43217' },
	];

	// Generate transactions over the last 3 months
	const rawTransactions: Omit<Transaction, 'billNo' | 'debit' | 'credit' | 'total'>[] = [];
	const materialMap = new Map(materials.map(m => [m.id, m]));
	
	// Helper to get date string
	const getDate = (daysAgo: number) => {
		const date = new Date(now);
		date.setDate(date.getDate() - daysAgo);
		return date.toISOString().slice(0, 10);
	};

	// Purchases (Raw Materials)
	rawTransactions.push(
		{ id: 't1', date: getDate(85), materialId: 'm1', materialName: 'Steel Rods (8mm)', category: 'Raw', type: 'Purchase', quantity: 2000, unitPrice: 82, partyId: 'p1', partyName: 'Metro Steel Suppliers', notes: 'Bulk order discount applied' },
		{ id: 't2', date: getDate(80), materialId: 'm2', materialName: 'Steel Rods (12mm)', category: 'Raw', type: 'Purchase', quantity: 1500, unitPrice: 90, partyId: 'p1', partyName: 'Metro Steel Suppliers', notes: 'Regular supply' },
		{ id: 't3', date: getDate(75), materialId: 'm3', materialName: 'Galvanized Wire Mesh', category: 'Raw', type: 'Purchase', quantity: 2500, unitPrice: 118, partyId: 'p7', partyName: 'Global Wire Industries', notes: 'Premium quality mesh' },
		{ id: 't4', date: getDate(70), materialId: 'm4', materialName: 'Concrete Mix', category: 'Raw', type: 'Purchase', quantity: 4000, unitPrice: 8, partyId: 'p2', partyName: 'ABC Hardware Mart', notes: 'Bulk delivery' },
		{ id: 't5', date: getDate(65), materialId: 'm5', materialName: 'PVC Coating Material', category: 'Raw', type: 'Purchase', quantity: 300, unitPrice: 175, partyId: 'p2', partyName: 'ABC Hardware Mart', notes: 'Weather-resistant grade' },
		{ id: 't6', date: getDate(60), materialId: 'm6', materialName: 'Welding Electrodes', category: 'Raw', type: 'Purchase', quantity: 2000, unitPrice: 11, partyId: 'p1', partyName: 'Metro Steel Suppliers', notes: 'Stainless steel grade' },
		{ id: 't7', date: getDate(50), materialId: 'm1', materialName: 'Steel Rods (8mm)', category: 'Raw', type: 'Purchase', quantity: 1000, unitPrice: 83, partyId: 'p1', partyName: 'Metro Steel Suppliers', notes: 'Restocking' },
		{ id: 't8', date: getDate(45), materialId: 'm3', materialName: 'Galvanized Wire Mesh', category: 'Raw', type: 'Purchase', quantity: 1500, unitPrice: 119, partyId: 'p7', partyName: 'Global Wire Industries', notes: 'Regular supply' },
		{ id: 't9', date: getDate(40), materialId: 'm4', materialName: 'Concrete Mix', category: 'Raw', type: 'Purchase', quantity: 3000, unitPrice: 8, partyId: 'p2', partyName: 'ABC Hardware Mart', notes: 'Bulk order' },
		{ id: 't10', date: getDate(30), materialId: 'm2', materialName: 'Steel Rods (12mm)', category: 'Raw', type: 'Purchase', quantity: 800, unitPrice: 91, partyId: 'p1', partyName: 'Metro Steel Suppliers', notes: 'Urgent restock' },
	);

	// Sales (Final Products)
	rawTransactions.push(
		{ id: 't11', date: getDate(78), materialId: 'm12', materialName: 'Residential Fence (50m)', category: 'Final', type: 'Sale', quantity: 2, unitPrice: 45000, partyId: 'p3', partyName: 'Prime Construction Co.', notes: 'New housing project' },
		{ id: 't12', date: getDate(72), materialId: 'm13', materialName: 'Commercial Fence (100m)', category: 'Final', type: 'Sale', quantity: 1, unitPrice: 95000, partyId: 'p5', partyName: 'City Infrastructure Ltd.', notes: 'Factory perimeter fencing' },
		{ id: 't13', date: getDate(68), materialId: 'm14', materialName: 'Security Gate (Single)', category: 'Final', type: 'Sale', quantity: 4, unitPrice: 18500, partyId: 'p4', partyName: 'Green Valley Builders', notes: 'Residential complex' },
		{ id: 't14', date: getDate(62), materialId: 'm16', materialName: 'Garden Fence Kit', category: 'Final', type: 'Sale', quantity: 6, unitPrice: 12500, partyId: 'p6', partyName: 'Sharma Enterprises', notes: 'Landscaping project' },
		{ id: 't15', date: getDate(55), materialId: 'm12', materialName: 'Residential Fence (50m)', category: 'Final', type: 'Sale', quantity: 3, unitPrice: 45000, partyId: 'p8', partyName: 'Modern Homes Pvt. Ltd.', notes: 'Multiple units' },
		{ id: 't16', date: getDate(48), materialId: 'm15', materialName: 'Security Gate (Double)', category: 'Final', type: 'Sale', quantity: 2, unitPrice: 32000, partyId: 'p5', partyName: 'City Infrastructure Ltd.', notes: 'Main entrance gates' },
		{ id: 't17', date: getDate(42), materialId: 'm14', materialName: 'Security Gate (Single)', category: 'Final', type: 'Sale', quantity: 3, unitPrice: 18500, partyId: 'p3', partyName: 'Prime Construction Co.', notes: 'Ongoing project' },
		{ id: 't18', date: getDate(35), materialId: 'm13', materialName: 'Commercial Fence (100m)', category: 'Final', type: 'Sale', quantity: 1, unitPrice: 95000, partyId: 'p4', partyName: 'Green Valley Builders', notes: 'Warehouse security' },
		{ id: 't19', date: getDate(28), materialId: 'm16', materialName: 'Garden Fence Kit', category: 'Final', type: 'Sale', quantity: 4, unitPrice: 12500, partyId: 'p6', partyName: 'Sharma Enterprises', notes: 'Garden renovation' },
		{ id: 't20', date: getDate(20), materialId: 'm12', materialName: 'Residential Fence (50m)', category: 'Final', type: 'Sale', quantity: 2, unitPrice: 45000, partyId: 'p8', partyName: 'Modern Homes Pvt. Ltd.', notes: 'New development' },
		{ id: 't21', date: getDate(15), materialId: 'm14', materialName: 'Security Gate (Single)', category: 'Final', type: 'Sale', quantity: 5, unitPrice: 18500, partyId: 'p3', partyName: 'Prime Construction Co.', notes: 'Bulk order discount' },
		{ id: 't22', date: getDate(10), materialId: 'm15', materialName: 'Security Gate (Double)', category: 'Final', type: 'Sale', quantity: 1, unitPrice: 32000, partyId: 'p5', partyName: 'City Infrastructure Ltd.', notes: 'Corporate office' },
		{ id: 't23', date: getDate(5), materialId: 'm16', materialName: 'Garden Fence Kit', category: 'Final', type: 'Sale', quantity: 3, unitPrice: 12500, partyId: 'p4', partyName: 'Green Valley Builders', notes: 'Residential project' },
		{ id: 't24', date: getDate(2), materialId: 'm12', materialName: 'Residential Fence (50m)', category: 'Final', type: 'Sale', quantity: 1, unitPrice: 45000, partyId: 'p8', partyName: 'Modern Homes Pvt. Ltd.', notes: 'Latest order' },
	);

	// Add ledger fields (billNo, debit, credit) and calculate running balances
	let billCounter = 1;
	const transactions: Transaction[] = rawTransactions.map(t => {
		const totalAmount = t.quantity * t.unitPrice;
		const debit = t.type === 'Purchase' || t.type === 'Sale' ? totalAmount : 0;
		const credit = 0;
		return {
			...t,
			billNo: `BILL-${Date.now()}-${billCounter++}`,
			debit,
			credit,
			total: 0, // Will be calculated below
		};
	});

	// Calculate running balances per party (sorted by date ascending)
	const transactionsByParty = new Map<string, Transaction[]>();
	transactions.forEach(t => {
		if (t.partyId) {
			if (!transactionsByParty.has(t.partyId)) {
				transactionsByParty.set(t.partyId, []);
			}
			transactionsByParty.get(t.partyId)!.push(t);
		}
	});

	transactionsByParty.forEach((partyTransactions) => {
		partyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		let cumulativeTotal = 0;
		partyTransactions.forEach(t => {
			cumulativeTotal = cumulativeTotal + t.debit - t.credit;
			t.total = cumulativeTotal;
		});
	});

	// Update material quantities based on transactions
	transactions.forEach(t => {
		if (t.materialId) {
			const material = materialMap.get(t.materialId);
			if (material) {
				const delta = t.type === 'Purchase' ? t.quantity : -t.quantity;
				material.quantity = Math.max(0, material.quantity + delta);
			}
		}
	});

	return { materials, parties, transactions };
}

// Migrate old transactions to include ledger fields
function migrateTransactions(transactions: any[]): Transaction[] {
	return transactions.map((t, index) => {
		// If transaction already has all ledger fields, return as-is
		if (t.billNo && typeof t.debit === 'number' && typeof t.credit === 'number' && typeof t.total === 'number') {
			return t as Transaction;
		}
		
		// Calculate ledger fields for old transactions
		const totalAmount = (t.quantity || 0) * (t.unitPrice || 0);
		const debit = t.type === 'Purchase' || t.type === 'Sale' ? totalAmount : 0;
		const credit = 0;
		
		return {
			...t,
			billNo: t.billNo || `BILL-MIGRATED-${Date.now()}-${index}`,
			debit,
			credit,
			total: 0, // Will be recalculated below
		} as Transaction;
	});
}

// Recalculate running balances for migrated transactions
function recalculateRunningBalances(transactions: Transaction[]): Transaction[] {
	const transactionsByParty = new Map<string, Transaction[]>();
	
	transactions.forEach(t => {
		if (t.partyId) {
			if (!transactionsByParty.has(t.partyId)) {
				transactionsByParty.set(t.partyId, []);
			}
			transactionsByParty.get(t.partyId)!.push(t);
		}
	});
	
	transactionsByParty.forEach((partyTransactions) => {
		partyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		let cumulativeTotal = 0;
		partyTransactions.forEach(t => {
			cumulativeTotal = cumulativeTotal + (t.debit || 0) - (t.credit || 0);
			t.total = cumulativeTotal;
		});
	});
	
	return transactions;
}

function load(): Pick<StoreState, 'materials' | 'parties' | 'transactions'> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			// Only return if we have data, otherwise use dummy data
			if (parsed.materials && parsed.materials.length > 0) {
				// Migrate transactions if needed
				if (parsed.transactions && parsed.transactions.length > 0) {
					const migrated = migrateTransactions(parsed.transactions);
					const recalculated = recalculateRunningBalances(migrated);
					return {
						...parsed,
						transactions: recalculated,
					};
				}
				return parsed;
			}
		}
	} catch {}
	// Return dummy data for first-time users
	return generateDummyData();
}

const initial = load();

export const useStore = create<StoreState>((set, get) => ({
	materials: initial.materials,
	parties: initial.parties,
	transactions: initial.transactions,

	addMaterial: (m) => set((s) => {
		const next: StoreState = { ...s, materials: [...s.materials, { ...m, id: crypto.randomUUID() }] } as StoreState;
		persist(next);
		return next;
	}),
	updateMaterial: (id, m) => set((s) => {
		const next: StoreState = { ...s, materials: s.materials.map(x => x.id === id ? { ...x, ...m } : x) } as StoreState;
		persist(next);
		return next;
	}),
	removeMaterial: (id) => set((s) => {
		const next: StoreState = { ...s, materials: s.materials.filter(x => x.id !== id) } as StoreState;
		persist(next);
		return next;
	}),

	addParty: (p) => set((s) => {
		const next: StoreState = { ...s, parties: [...s.parties, { ...p, id: crypto.randomUUID() }] } as StoreState;
		persist(next);
		return next;
	}),
	updateParty: (id, p) => set((s) => {
		const next: StoreState = { ...s, parties: s.parties.map(x => x.id === id ? { ...x, ...p } : x) } as StoreState;
		persist(next);
		return next;
	}),
	removeParty: (id) => set((s) => {
		const next: StoreState = { ...s, parties: s.parties.filter(x => x.id !== id) } as StoreState;
		persist(next);
		return next;
	}),

	addTransaction: (t) => set((s) => {
		let materialName = undefined;
		let category = undefined;
		let updatedMaterials = s.materials;

		if (t.type !== 'Payment' && t.type !== 'Receipt' && t.materialId) {
			const material = s.materials.find(m => m.id === t.materialId);
			if (!material) return s;
			materialName = material.name;
			category = material.category;

			// update stock
			const delta = t.type === 'Purchase' ? t.quantity : -t.quantity;
			updatedMaterials = s.materials.map(m => m.id === material.id ? { ...m, quantity: Math.max(0, m.quantity + delta) } : m);
		}
		
		const totalAmount = t.quantity * t.unitPrice;
		
		let debit = 0;
		let credit = 0;

		if (t.type === 'Purchase') {
			debit = totalAmount;
		} else if (t.type === 'Sale') {
			debit = totalAmount; 
		} else if (t.type === 'Payment') {
			credit = totalAmount;
		} else if (t.type === 'Receipt') {
			credit = totalAmount;
		}
		
		const tx: Transaction = {
			...t,
			id: crypto.randomUUID(),
			billNo: generateBillNo(),
			materialName,
			category,
			debit,
			credit,
			total: 0, // Will be calculated below
		};
		
		// Recalculate running balances for all transactions of this party (sorted by date ascending)
		const allPartyTransactions = [...s.transactions.filter(tr => tr.partyId === t.partyId), tx]
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		
		let cumulativeTotal = 0;
		const recalculatedPartyTransactions = allPartyTransactions.map(tr => {
			cumulativeTotal = cumulativeTotal + tr.debit - tr.credit;
			return { ...tr, total: cumulativeTotal };
		});
		
		// Merge with other transactions and sort by date descending (newest first)
		const otherTransactions = s.transactions.filter(tr => tr.partyId !== t.partyId);
		const updatedTransactions = [...otherTransactions, ...recalculatedPartyTransactions]
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		const next: StoreState = { ...s, materials: updatedMaterials, transactions: updatedTransactions } as StoreState;
		persist(next);
		return next;
	}),
	updateTransaction: (id, t) => set((s) => {
		const transaction = s.transactions.find(tx => tx.id === id);
		if (!transaction) return s;
		
		// If materialId changed, get new material info
		let updatedTransaction = { ...transaction, ...t };
		if (t.materialId && t.materialId !== transaction.materialId) {
			const material = s.materials.find(m => m.id === t.materialId);
			if (material) {
				updatedTransaction.materialName = material.name;
				updatedTransaction.category = material.category;
			}
		}
		
		// Recalculate debit/credit based on transaction type and amount
		const totalAmount = (updatedTransaction.quantity || transaction.quantity) * (updatedTransaction.unitPrice || transaction.unitPrice);
		const transactionType = updatedTransaction.type || transaction.type;
		updatedTransaction.debit = transactionType === 'Purchase' ? totalAmount : 0;
		updatedTransaction.credit = transactionType === 'Sale' ? totalAmount : 0;
		
		// Update the transaction in the list
		const updatedTransactions = s.transactions.map(tx => tx.id === id ? updatedTransaction : tx);
		
		// Recalculate running balances for all transactions of this party (sorted by date ascending)
		const partyId = updatedTransaction.partyId || transaction.partyId;
		if (partyId) {
			const partyTransactions = updatedTransactions
				.filter(tr => tr.partyId === partyId)
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
			
			let cumulativeTotal = 0;
			const recalculatedPartyTransactions = partyTransactions.map(tr => {
				cumulativeTotal = cumulativeTotal + tr.debit - tr.credit;
				return { ...tr, total: cumulativeTotal };
			});
			
			// Merge with other transactions and sort by date descending (newest first)
			const otherTransactions = updatedTransactions.filter(tr => tr.partyId !== partyId);
			const finalTransactions = [...otherTransactions, ...recalculatedPartyTransactions]
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			
			const next: StoreState = { ...s, transactions: finalTransactions } as StoreState;
			persist(next);
			return next;
		}
		
		const next: StoreState = { ...s, transactions: updatedTransactions } as StoreState;
		persist(next);
		return next;
	}),
	removeTransaction: (id) => set((s) => {
		const transaction = s.transactions.find(tx => tx.id === id);
		if (!transaction) return s;
		
		// Remove the transaction
		const remainingTransactions = s.transactions.filter(x => x.id !== id);
		
		// Recalculate running balances for the party's remaining transactions
		const partyId = transaction.partyId;
		if (partyId) {
			const partyTransactions = remainingTransactions
				.filter(tr => tr.partyId === partyId)
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
			
			let cumulativeTotal = 0;
			const recalculatedPartyTransactions = partyTransactions.map(tr => {
				cumulativeTotal = cumulativeTotal + tr.debit - tr.credit;
				return { ...tr, total: cumulativeTotal };
			});
			
			// Merge with other transactions and sort by date descending (newest first)
			const otherTransactions = remainingTransactions.filter(tr => tr.partyId !== partyId);
			const finalTransactions = [...otherTransactions, ...recalculatedPartyTransactions]
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			
			const next: StoreState = { ...s, transactions: finalTransactions } as StoreState;
			persist(next);
			return next;
		}
		
		const next: StoreState = { ...s, transactions: remainingTransactions } as StoreState;
		persist(next);
		return next;
	}),

	getMaterialById: (id) => get().materials.find(m => m.id === id),
	getPartyById: (id) => get().parties.find(p => p.id === id),
	getTotals: () => {
		const { transactions, materials } = get();
		const totalPurchases = transactions.filter(t => t.type === 'Purchase').reduce((a, t) => a + t.quantity * t.unitPrice, 0);
		const totalSales = transactions.filter(t => t.type === 'Sale').reduce((a, t) => a + t.quantity * t.unitPrice, 0);
		const stockValue = materials.reduce((a, m) => a + m.quantity * (m.unitPrice || 0), 0);
		const profit = totalSales - totalPurchases;
		return { totalPurchases, totalSales, stockValue, profit };
	},
}));


