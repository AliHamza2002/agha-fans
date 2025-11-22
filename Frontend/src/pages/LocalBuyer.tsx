import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useStore } from '../store/store';
import { AddBuyerModal } from '../components/AddBuyerModal';
import { useLocalBuyer } from '../contexts/LocalBuyerContext';

export default function LocalBuyer() {
	const navigate = useNavigate();
	const { materials } = useStore();
	const { buyers, setPendingBuyer } = useLocalBuyer();
	const [modalOpen, setModalOpen] = useState(false);

	const finishedMaterials = materials.filter(m => m.category === 'Final');

	const handleSaveBuyer = (buyerData: any) => {
		// Store as pending buyer (not yet posted)
		setPendingBuyer(buyerData);
		setModalOpen(false);
		// Navigate to receipt page
		navigate('/receipt');
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
					<Users className="h-6 w-6 text-indigo-600" />
					Local Buyer
				</h1>
				<button
					className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium"
					onClick={() => setModalOpen(true)}
				>
					<Plus className="h-4 w-4" /> Add New Buyer
				</button>
			</div>

			<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200">
				<h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Local Buyers</h2>
				{buyers.length === 0 ? (
					<div className="text-center py-12">
						<Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
						<p className="text-slate-500">No local buyers yet. Click "Add New Buyer" to get started.</p>
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

			<AddBuyerModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				onSave={handleSaveBuyer}
				finishedMaterials={finishedMaterials}
			/>
		</div>
	);
}


