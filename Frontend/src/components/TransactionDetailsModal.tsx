import { X, Calendar, FileText, User, Package, CreditCard, Tag } from 'lucide-react';
import type { Transaction } from '../store/store';
import { format } from 'date-fns';

interface TransactionDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	transaction: Transaction | null;
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
	if (!isOpen || !transaction) return null;

	const isPurchase = transaction.type === 'Purchase';
	const isSale = transaction.type === 'Sale';
	const isPayment = transaction.type === 'Payment';
	const isReceipt = transaction.type === 'Receipt';

	const getTypeColor = () => {
		if (isPurchase) return 'bg-blue-100 text-blue-700';
		if (isSale) return 'bg-emerald-100 text-emerald-700';
		if (isPayment) return 'bg-orange-100 text-orange-700';
		if (isReceipt) return 'bg-indigo-100 text-indigo-700';
		return 'bg-slate-100 text-slate-700';
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scale-in">
				{/* Header */}
				<div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className={`p-2 rounded-lg ${getTypeColor()}`}>
							<FileText className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-slate-900">Transaction Details</h3>
							<p className="text-xs text-slate-500 font-mono">{transaction.billNo}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Top Row: Date & Type */}
					<div className="grid grid-cols-2 gap-6">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-slate-100 rounded-lg text-slate-600">
								<Calendar className="w-4 h-4" />
							</div>
							<div>
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date</p>
								<p className="text-sm font-semibold text-slate-900 mt-0.5">
									{format(new Date(transaction.date), 'dd MMMM yyyy')}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="p-2 bg-slate-100 rounded-lg text-slate-600">
								<Tag className="w-4 h-4" />
							</div>
							<div>
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type</p>
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getTypeColor()}`}>
									{transaction.type}
								</span>
							</div>
						</div>
					</div>

					<div className="h-px bg-slate-100" />

					{/* Party Details */}
					<div className="flex items-start gap-3">
						<div className="p-2 bg-slate-100 rounded-lg text-slate-600">
							<User className="w-4 h-4" />
						</div>
						<div>
							<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Party</p>
							<p className="text-base font-bold text-slate-900 mt-0.5">{transaction.partyName || 'Unknown Party'}</p>
							{/* We could show contact info here if we fetched the full party object, but transaction stores snapshot */}
						</div>
					</div>

					<div className="h-px bg-slate-100" />

					{/* Item / Payment Details */}
					{(isPurchase || isSale) ? (
						<div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
							<div className="flex items-start gap-3 mb-4">
								<div className="p-2 bg-white border border-slate-200 rounded-lg text-indigo-600 shadow-sm">
									<Package className="w-4 h-4" />
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Item Details</p>
									<p className="text-base font-bold text-slate-900 mt-0.5">{transaction.materialName}</p>
									{transaction.category && (
										<span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 mt-1 inline-block">
											{transaction.category}
										</span>
									)}
								</div>
							</div>
							
							<div className="grid grid-cols-3 gap-4">
								<div>
									<p className="text-xs text-slate-500 mb-1">Quantity</p>
									<p className="font-mono font-medium text-slate-900">{transaction.quantity}</p>
								</div>
								<div>
									<p className="text-xs text-slate-500 mb-1">Rate</p>
									<p className="font-mono font-medium text-slate-900">Rs. {transaction.unitPrice.toLocaleString()}</p>
								</div>
								<div className="text-right">
									<p className="text-xs text-slate-500 mb-1">Total</p>
									<p className="font-bold text-indigo-600">Rs. {(transaction.quantity * transaction.unitPrice).toLocaleString()}</p>
								</div>
							</div>
						</div>
					) : (
						<div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
							<div className="flex items-start gap-3">
								<div className="p-2 bg-white border border-slate-200 rounded-lg text-emerald-600 shadow-sm">
									<CreditCard className="w-4 h-4" />
								</div>
								<div className="flex-1">
									<p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Details</p>
									<div className="flex justify-between items-end mt-1">
										<div>
											<p className="text-base font-medium text-slate-900">{transaction.notes || 'No notes'}</p>
										</div>
										<p className="text-xl font-bold text-emerald-600">Rs. {Math.max(transaction.debit, transaction.credit).toLocaleString()}</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Notes Section (if not payment/receipt where notes are main desc) */}
					{(isPurchase || isSale) && transaction.notes && (
						<div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-sm text-yellow-800">
							<span className="font-semibold mr-2">Note:</span>
							{transaction.notes}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition shadow-sm"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
