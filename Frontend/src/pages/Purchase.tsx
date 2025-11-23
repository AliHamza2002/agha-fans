import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Eye, Search, Plus, CreditCard } from 'lucide-react';
import { useStore } from '../store/store';
import { AddPurchaseModal } from '../components/AddPurchaseModal';
import { AddPaymentModal } from '../components/AddPaymentModal';

export default function Purchase() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { parties, transactions } = useStore();
	const [searchQuery, setSearchQuery] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);

	useEffect(() => {
		if (searchParams.get('new') === 'purchase') {
			setModalOpen(true);
			// Clear the query param
			setSearchParams({}, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	// Filter parties to show only Suppliers
	const supplierParties = useMemo(() => {
		const filtered = parties.filter(p => p.type === 'Supplier');
		if (!searchQuery) return filtered;
		return filtered.filter(p => 
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(p.contact && p.contact.toLowerCase().includes(searchQuery.toLowerCase()))
		);
	}, [parties, searchQuery]);

	const getPartyTransactionCount = (partyId: string) => {
		return transactions.filter(t => t.partyId === partyId).length;
	};

	const getPartyTotalAmount = (partyId: string) => {
		return transactions
			.filter(t => t.partyId === partyId)
			.reduce((sum, t) => sum + (t.quantity * t.unitPrice), 0);
	};

	const handleViewDetails = (partyId: string) => {
		navigate(`/purchase/party-details/${partyId}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
					<ShoppingCart className="h-6 w-6 text-indigo-600" />
					Purchase Management
				</h1>
			</div>

			{/* Purchase Ledger */}
			<div className="flex items-center justify-between">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<input
						type="text"
						placeholder="Search suppliers..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
					/>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => setPaymentModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md font-medium"
					>
						<CreditCard className="h-4 w-4" /> Add Payment
					</button>
					<button
						onClick={() => setModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium"
					>
						<Plus className="h-4 w-4" /> Add Purchase
					</button>
				</div>
			</div>

			<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200 overflow-auto">
				<h2 className="text-lg font-semibold text-slate-900 mb-4">Supplier Ledgers</h2>
				{supplierParties.length === 0 ? (
					<div className="text-center py-12">
						<ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
						<p className="text-slate-500">No suppliers found. Add suppliers from the Parties page.</p>
					</div>
				) : (
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-center text-slate-600 border-b border-slate-200">
								<th className="p-3 font-semibold">Supplier Name</th>
								<th className="p-3 font-semibold">Type</th>
								<th className="p-3 font-semibold">Contact</th>
								<th className="p-3 font-semibold">Transactions</th>
								<th className="p-3 font-semibold">Total Amount</th>
								<th className="p-3 font-semibold text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{supplierParties.map(party => (
								<tr key={party.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
									<td className="p-3 font-semibold text-slate-900 text-center">{party.name}</td>
									<td className="p-3 text-center">
										<span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
											{party.type}
										</span>
									</td>
									<td className="p-3 text-slate-600 text-center">{party.contact || '-'}</td>
									<td className="p-3 font-medium text-slate-900 text-center">{getPartyTransactionCount(party.id)}</td>
									<td className="p-3 font-semibold text-slate-900 text-center">
										Rs. {getPartyTotalAmount(party.id).toLocaleString()}
									</td>
									<td className="p-3 text-center">
										<button
											onClick={() => handleViewDetails(party.id)}
											className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
										>
											<Eye className="h-3 w-3" /> View Ledger
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<AddPurchaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
			<AddPaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
		</div>
	);
}


