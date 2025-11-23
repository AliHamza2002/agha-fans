import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Search, Receipt, PlusCircle } from 'lucide-react';
import { useStore } from '../store/store';
import { AddReceiptModal } from '../components/AddReceiptModal';
import { AddSaleModal } from '../components/AddSaleModal';

export default function Sales() {
	const navigate = useNavigate();
	const { parties, transactions } = useStore();
	const [searchQuery, setSearchQuery] = useState('');
	const [receiptModalOpen, setReceiptModalOpen] = useState(false);
	const [saleModalOpen, setSaleModalOpen] = useState(false);

	// Filter parties to show only Buyers
	const buyerParties = useMemo(() => {
		const filtered = parties.filter(p => p.type === 'Buyer');
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
		navigate(`/sales/party-details/${partyId}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
					<ShoppingBag className="h-6 w-6 text-indigo-600" />
					Sales Management
				</h1>
				<div className="flex gap-2">
					<button
						onClick={() => setSaleModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium"
					>
						<PlusCircle className="h-4 w-4" /> Add Sale
					</button>
					<button
						onClick={() => setReceiptModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md font-medium"
					>
						<Receipt className="h-4 w-4" /> Add Receipt
					</button>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
					<input
						type="text"
						placeholder="Search buyers..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200 overflow-auto">
				<h2 className="text-lg font-semibold text-slate-900 mb-4">Buyer Ledgers</h2>
				{buyerParties.length === 0 ? (
					<div className="text-center py-12">
						<ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
						<p className="text-slate-500">No buyers found. Add buyers from the Parties page.</p>
					</div>
				) : (
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-center text-slate-600 border-b border-slate-200">
								<th className="p-3 font-semibold">Buyer Name</th>
								<th className="p-3 font-semibold">Type</th>
								<th className="p-3 font-semibold">Contact</th>
								<th className="p-3 font-semibold">Transactions</th>
								<th className="p-3 font-semibold">Total Amount</th>
								<th className="p-3 font-semibold text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{buyerParties.map(party => (
								<tr key={party.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
									<td className="p-3 font-semibold text-slate-900 text-center">{party.name}</td>
									<td className="p-3 text-center">
										<span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
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

			<AddReceiptModal
				isOpen={receiptModalOpen}
				onClose={() => setReceiptModalOpen(false)}
			/>
			
			<AddSaleModal
				isOpen={saleModalOpen}
				onClose={() => setSaleModalOpen(false)}
			/>
		</div>
	);
}


