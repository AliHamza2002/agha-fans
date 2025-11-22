import { createContext, useContext, useState, type PropsWithChildren } from 'react';

export interface BuyerItem {
	itemName: string;
	itemPrice: number;
}

export interface LocalBuyerData {
	buyerName: string;
	contact?: string;
	address?: string;
	items: BuyerItem[];
	totalAmount: number;
	date: string;
}

interface LocalBuyerContextType {
	buyers: LocalBuyerData[];
	addBuyer: (buyer: LocalBuyerData) => void;
	pendingBuyer: LocalBuyerData | null;
	setPendingBuyer: (buyer: LocalBuyerData | null) => void;
}

const LocalBuyerContext = createContext<LocalBuyerContextType | undefined>(undefined);

export function LocalBuyerProvider({ children }: PropsWithChildren) {
	const [buyers, setBuyers] = useState<LocalBuyerData[]>([]);
	const [pendingBuyer, setPendingBuyer] = useState<LocalBuyerData | null>(null);

	const addBuyer = (buyer: LocalBuyerData) => {
		setBuyers(prev => [...prev, buyer]);
	};

	return (
		<LocalBuyerContext.Provider value={{ buyers, addBuyer, pendingBuyer, setPendingBuyer }}>
			{children}
		</LocalBuyerContext.Provider>
	);
}

export function useLocalBuyer() {
	const context = useContext(LocalBuyerContext);
	if (!context) {
		throw new Error('useLocalBuyer must be used within LocalBuyerProvider');
	}
	return context;
}

