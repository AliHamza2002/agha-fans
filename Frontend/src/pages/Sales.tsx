import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag, Eye, Search } from 'lucide-react';
import { useStore } from '../store/store';
import { AddBuyerModal } from '../components/AddBuyerModal';
import { useLocalBuyer } from '../contexts/LocalBuyerContext';

export default function Sales() {
	const navigate = useNavigate();
	const { materials, parties, transactions } = useStore();
	const { buyers, setPendingBuyer } = useLocalBuyer();
	const [modalOpen, setModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'ledger' | 'local-sales'>('ledger');

	const finishedMaterials = materials.filter(m => m.category === 'Final');

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

	const handleSaveBuyer = (buyerData: any) => {
		// Store as pending buyer (not yet posted)
		setPendingBuyer(buyerData);
		setModalOpen(false);
		// Navigate to receipt page
		navigate('/receipt');
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
					<ShoppingBag className="h-6 w-6 text-indigo-600" />
					Sales Management
				</h1>
			</div>

			{/* Tab Navigation */}
			<div className="bg-white rounded-2xl p-2 shadow-soft border border-slate-200 inline-flex gap-2">
				<button
					onClick={() => setActiveTab('ledger')}
					className={`px-4 py-2 rounded-xl font-medium transition ${
						activeTab === 'ledger'
							? 'bg-brand text-white shadow-md'
							: 'text-slate-600 hover:bg-slate-100'
					}`}
				>
					Sales Ledger (Buyers)
				</button>
				<button
					onClick={() => setActiveTab('local-sales')}
					className={`px-4 py-2 rounded-xl font-medium transition ${
						activeTab === 'local-sales'
							? 'bg-brand text-white shadow-md'
							: 'text-slate-600 hover:bg-slate-100'
					}`}
				>
					Local Sales
				</button>
			</div>

			{/* Sales Ledger Tab */}
			{activeTab === 'ledger' && (
				<>
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
									<tr className="text-left text-slate-600 border-b border-slate-200">
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
											<td className="p-3 font-semibold text-slate-900">{party.name}</td>
											<td className="p-3">
												<span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
													{party.type}
												</span>
											</td>
											<td className="p-3 text-slate-600">{party.contact || '-'}</td>
											<td className="p-3 font-medium text-slate-900">{getPartyTransactionCount(party.id)}</td>
											<td className="p-3 font-semibold text-slate-900">
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
				</>
			)}

			{/* Local Sales Tab */}
			{activeTab === 'local-sales' && (
				<>
					<div className="flex items-center justify-between">
						<p className="text-slate-600">Manage direct sales to local buyers</p>
						<button
							className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium"
							onClick={() => setModalOpen(true)}
						>
							<Plus className="h-4 w-4" /> Add New Sale
						</button>
					</div>

					<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200">
						<h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Local Sales</h2>
						{buyers.length === 0 ? (
							<div className="text-center py-12">
								<ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
								<p className="text-slate-500">No local sales yet. Click "Add New Sale" to get started.</p>
							</div>
						) : (
							<div className="overflow-auto">
								<table className="min-w-full text-sm">
									<thead>
										<tr className="text-left text-slate-600 border-b border-slate-200">
											<th className="p-3 font-semibold">Date</th>
											<th className="p-3 font-semibold">Buyer Name</th>
											<th className="p-3 font-semibold">Contact</th>
											<th className="p-3 font-semibold">Items</th>
											<th className="p-3 font-semibold">Total Amount</th>
										</tr>
									</thead>
									<tbody>
										{buyers.map((buyer, index) => (
											<tr key={index} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
												<td className="p-3 text-slate-600">{new Date(buyer.date).toLocaleDateString()}</td>
												<td className="p-3 font-semibold text-slate-900">{buyer.buyerName}</td>
												<td className="p-3 text-slate-600">{buyer.contact || '-'}</td>
												<td className="p-3 text-slate-900">
													<div className="text-sm">
														{buyer.items.map((item, idx) => (
															<div key={idx} className="mb-1">
																{item.itemName} - Rs. {item.itemPrice.toLocaleString()}
															</div>
														))}
													</div>
												</td>
												<td className="p-3 font-semibold text-slate-900">Rs. {buyer.totalAmount.toLocaleString()}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</>
			)}

			<AddBuyerModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				onSave={handleSaveBuyer}
				finishedMaterials={finishedMaterials}
			/>
		</div>
	);
}


