import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, type Transaction } from '../store/store';
import { ArrowLeft, FileText, Trash2 } from 'lucide-react';
import { toast } from '../components/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';

export default function SalesPartyDetails() {
	const { partyId } = useParams<{ partyId: string }>();
	const navigate = useNavigate();
	const { parties, transactions, removeTransaction } = useStore();
	

	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; transactionId: string }>({ 
		open: false, 
		transactionId: '' 
	});
	const [detailsModalOpen, setDetailsModalOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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

	const totalDebit = partyTransactions.reduce((sum, t) => sum + t.debit, 0);
	const totalCredit = partyTransactions.reduce((sum, t) => sum + t.credit, 0);
	const closingBalance = partyTransactions.length > 0 ? partyTransactions[partyTransactions.length - 1].total : 0;







	// *** ERROR HANDLING: Async function to properly catch API errors ***
	const handleDelete = async () => {
		try {
			await removeTransaction(deleteDialog.transactionId);
			toast.success('Transaction deleted successfully');
		} catch (error: any) {
			console.error('Failed to delete transaction:', error);
			// *** ERROR HANDLING: Show actual API error message ***
			toast.error(error.message || 'Failed to delete transaction');
		}
	};

	const handleGeneratePDF = () => {
		window.print();
		toast.success('Print dialog opened');
	};

	const handleViewDetails = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		setDetailsModalOpen(true);
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
						<p className="text-xs font-medium text-slate-600 mb-1">Current Balance</p>
						<p className={`text-base font-bold ${closingBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
							{Math.abs(closingBalance).toLocaleString()} {closingBalance >= 0 ? 'Dr' : 'Cr'}
						</p>
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
								<tr className="text-center text-slate-600 border-b border-slate-200">
									<th className="p-3 font-semibold">Date</th>
									<th className="p-3 font-semibold">Invoice No.</th>
									<th className="p-3 font-semibold text-left">Description</th>
									<th className="p-3 font-semibold">Quantity</th>
									<th className="p-3 font-semibold">Rate</th>
									<th className="p-3 font-semibold">Debit</th>
									<th className="p-3 font-semibold">Credit</th>
									<th className="p-3 font-semibold">Balance</th>
									<th className="p-3 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody>
								{partyTransactions.map(t => (
									<tr key={t.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
										<td className="p-3 text-slate-600 text-center">{new Date(t.date).toLocaleDateString()}</td>
										<td className="p-3 font-medium text-slate-900 text-center">
											{t.type === 'Receipt' ? (
												<span className="text-slate-400">-</span>
											) : (
												<button 
													onClick={() => handleViewDetails(t)}
													className="text-indigo-600 hover:text-indigo-800 hover:underline font-mono"
												>
													{t.billNo}
												</button>
											)}
										</td>
										<td className="p-3 text-slate-900 text-left">
											{t.type === 'Receipt' ? (
												<span className="font-medium text-emerald-700">{t.notes || 'Payment Received'}</span>
											) : (
												<span>
													<span className="font-medium">{t.materialName}</span>
													{t.category && <span className="text-xs text-slate-500 ml-2">({t.category})</span>}
													{t.notes && <div className="text-xs text-slate-500 mt-0.5">{t.notes}</div>}
												</span>
											)}
										</td>
										<td className="p-3 text-slate-600 text-center">
											{t.type === 'Receipt' ? '-' : t.quantity}
										</td>
										<td className="p-3 text-slate-600 text-center">
											{t.type === 'Receipt' ? '-' : t.unitPrice.toLocaleString()}
										</td>
										<td className="p-3 font-medium text-slate-900 text-center">
											{t.debit > 0 ? t.debit.toLocaleString() : ''}
										</td>
										<td className="p-3 font-medium text-slate-900 text-center">
											{t.credit > 0 ? t.credit.toLocaleString() : ''}
										</td>
										<td className="p-3 font-bold text-slate-900 text-center">
											{Math.abs(t.total).toLocaleString()} {t.total >= 0 ? 'Dr' : 'Cr'}
										</td>
										<td className="p-3 text-center">
											<div className="flex gap-2 justify-center">

												<button
													onClick={() => setDeleteDialog({ open: true, transactionId: t.id })}
													className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
													title="Delete"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
									<td colSpan={5} className="p-3 text-right">Total:</td>
									<td className="p-3 text-center text-blue-700">{totalDebit.toLocaleString()}</td>
									<td className="p-3 text-center text-emerald-700">{totalCredit.toLocaleString()}</td>
									<td className="p-3 text-center">
										{Math.abs(closingBalance).toLocaleString()} {closingBalance >= 0 ? 'Dr' : 'Cr'}
									</td>
									<td></td>
								</tr>
							</tfoot>
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

			<TransactionDetailsModal
				isOpen={detailsModalOpen}
				onClose={() => setDetailsModalOpen(false)}
				transaction={selectedTransaction}
			/>
		</div>
	);
}


