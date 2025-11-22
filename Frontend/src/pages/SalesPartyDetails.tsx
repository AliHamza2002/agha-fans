import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { ArrowLeft, FileText, Pencil, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '../components/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';

export default function SalesPartyDetails() {
	const { partyId } = useParams<{ partyId: string }>();
	const navigate = useNavigate();
	const { parties, transactions, materials, updateTransaction, removeTransaction } = useStore();
	
	const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<any>(null);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transactionId: string }>({ 
		open: false, 
		transactionId: '' 
	});

	const party = parties.find(p => p.id === partyId);
	const partyTransactions = useMemo(() => {
		const filtered = transactions.filter(t => t.partyId === partyId);
		// Sort by date ascending for ledger display (oldest first)
		return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}, [transactions, partyId]);

	if (!party) {
		return (
			<div className="space-y-6">
				<div className="bg-white rounded-2xl p-8 shadow-soft border border-slate-200 text-center">
					<p className="text-slate-600 mb-4">Buyer not found.</p>
					<button
						onClick={() => navigate('/sales')}
						className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand-hover transition"
					>
						<ArrowLeft className="h-4 w-4" /> Back to Sales
					</button>
				</div>
			</div>
		);
	}

	// Ensure this is a Buyer party
	if (party.type !== 'Buyer') {
		return (
			<div className="space-y-6">
				<div className="bg-white rounded-2xl p-8 shadow-soft border border-slate-200 text-center">
					<p className="text-slate-600 mb-4">This party is not a buyer.</p>
					<button
						onClick={() => navigate('/sales')}
						className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand-hover transition"
					>
						<ArrowLeft className="h-4 w-4" /> Back to Sales
					</button>
				</div>
			</div>
		);
	}

	const totalAmount = partyTransactions.reduce((sum, t) => sum + (t.quantity * t.unitPrice), 0);

	const handleEdit = (transaction: any) => {
		setEditingTransaction(transaction.id);
		setEditForm({
			date: transaction.date,
			materialId: transaction.materialId,
			type: transaction.type,
			quantity: transaction.quantity,
			unitPrice: transaction.unitPrice,
			notes: transaction.notes || '',
		});
	};

	const handleSaveEdit = () => {
		if (!editForm.materialId) {
			toast.error('Please select a material');
			return;
		}
		if (editForm.quantity <= 0) {
			toast.error('Quantity must be greater than 0');
			return;
		}
		if (editForm.unitPrice <= 0) {
			toast.error('Unit price must be greater than 0');
			return;
		}

		try {
			updateTransaction(editingTransaction!, editForm);
			toast.success('Transaction updated successfully');
			setEditingTransaction(null);
			setEditForm(null);
		} catch (error) {
			toast.error('Failed to update transaction');
		}
	};

	const handleCancelEdit = () => {
		setEditingTransaction(null);
		setEditForm(null);
	};

	const handleDelete = () => {
		try {
			removeTransaction(deleteDialog.transactionId);
			toast.success('Transaction deleted successfully');
		} catch (error) {
			toast.error('Failed to delete transaction');
		}
	};

	const handleGeneratePDF = () => {
		window.print();
		toast.success('Print dialog opened');
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<button
					onClick={() => navigate('/sales')}
					className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
				>
					<ArrowLeft className="h-4 w-4" /> Back to Sales
				</button>
				<button
					onClick={handleGeneratePDF}
					className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md font-medium"
				>
					<FileText className="h-4 w-4" /> Generate PDF
				</button>
			</div>

			{/* Party Information */}
			<div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
				<h2 className="text-xl font-bold text-slate-900 mb-4">Buyer Information</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<p className="text-xs font-medium text-slate-600 mb-1">Buyer Name</p>
						<p className="text-base font-semibold text-slate-900">{party.name}</p>
					</div>
					<div>
						<p className="text-xs font-medium text-slate-600 mb-1">Type</p>
						<span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
							{party.type}
						</span>
					</div>
					<div>
						<p className="text-xs font-medium text-slate-600 mb-1">Contact</p>
						<p className="text-base text-slate-900">{party.contact || '-'}</p>
					</div>
					<div>
						<p className="text-xs font-medium text-slate-600 mb-1">Total Transactions</p>
						<p className="text-base font-semibold text-slate-900">{partyTransactions.length}</p>
					</div>
					<div>
						<p className="text-xs font-medium text-slate-600 mb-1">Total Amount</p>
						<p className="text-base font-bold text-indigo-600">Rs. {totalAmount.toLocaleString()}</p>
					</div>
				</div>
			</div>

			{/* Ledger Table */}
			<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200">
				<h2 className="text-lg font-semibold text-slate-900 mb-4">Sales Ledger</h2>
				{partyTransactions.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-slate-500">No transactions found for this buyer.</p>
					</div>
				) : (
					<div className="overflow-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-slate-600 border-b border-slate-200">
									<th className="p-3 font-semibold">Date</th>
									<th className="p-3 font-semibold">Bill No</th>
									<th className="p-3 font-semibold">Total Amount</th>
									<th className="p-3 font-semibold">Credit</th>
									<th className="p-3 font-semibold">Debit</th>
									<th className="p-3 font-semibold">Total (Running Balance)</th>
									<th className="p-3 font-semibold text-center">Actions</th>
								</tr>
							</thead>
							<tbody>
								{partyTransactions.map(transaction => (
									<tr key={transaction.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
										{editingTransaction === transaction.id ? (
											<>
												<td className="p-3">
													<input
														type="date"
														className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
														value={editForm.date}
														onChange={e => setEditForm({ ...editForm, date: e.target.value })}
													/>
												</td>
												<td className="p-3 text-slate-600 text-xs">{transaction.billNo}</td>
												<td className="p-3">
													<div className="space-y-1">
														<input
															type="number"
															className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
															placeholder="Qty"
															value={editForm.quantity}
															onChange={e => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
														/>
														<input
															type="number"
															className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
															placeholder="Price"
															value={editForm.unitPrice}
															onChange={e => setEditForm({ ...editForm, unitPrice: Number(e.target.value) })}
														/>
														<div className="text-xs text-slate-500">Total: {(editForm.quantity * editForm.unitPrice).toLocaleString()}</div>
													</div>
												</td>
												<td className="p-3 text-slate-600">
													{editForm.type === 'Sale' ? (editForm.quantity * editForm.unitPrice).toLocaleString() : '0'}
												</td>
												<td className="p-3 text-slate-600">
													{editForm.type === 'Purchase' ? (editForm.quantity * editForm.unitPrice).toLocaleString() : '0'}
												</td>
												<td className="p-3 font-semibold text-slate-900">-</td>
												<td className="p-3">
													<div className="flex gap-1 justify-center">
														<button
															onClick={handleSaveEdit}
															className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
														>
															Save
														</button>
														<button
															onClick={handleCancelEdit}
															className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
														>
															<X className="h-3 w-3" />
														</button>
													</div>
												</td>
											</>
										) : (
											<>
												<td className="p-3 text-slate-600">{format(new Date(transaction.date), 'dd MMM yyyy')}</td>
												<td className="p-3 text-slate-600 text-xs font-mono">{transaction.billNo || 'N/A'}</td>
												<td className="p-3 font-semibold text-slate-900">
													Rs. {((transaction.quantity || 0) * (transaction.unitPrice || 0)).toLocaleString()}
												</td>
												<td className="p-3 text-emerald-600 font-medium">
													{(transaction.credit || 0) > 0 ? `Rs. ${(transaction.credit || 0).toLocaleString()}` : '-'}
												</td>
												<td className="p-3 text-blue-600 font-medium">
													{(transaction.debit || 0) > 0 ? `Rs. ${(transaction.debit || 0).toLocaleString()}` : '-'}
												</td>
												<td className="p-3 font-bold text-slate-900">
													Rs. {(transaction.total || 0).toLocaleString()}
												</td>
												<td className="p-3">
													<div className="flex gap-2 justify-center">
														<button
															onClick={() => handleEdit(transaction)}
															className="px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 transition"
														>
															<Pencil className="h-3 w-3" />
														</button>
														<button
															onClick={() => setDeleteDialog({ open: true, transactionId: transaction.id })}
															className="px-2 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
														>
															<Trash2 className="h-3 w-3" />
														</button>
													</div>
												</td>
											</>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<ConfirmDeleteDialog
				isOpen={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, transactionId: '' })}
				onConfirm={handleDelete}
				title="Delete Transaction"
				message="Are you sure you want to delete this transaction"
			/>
		</div>
	);
}


