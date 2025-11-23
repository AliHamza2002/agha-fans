import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/store';
import { toast } from './Toast';

interface AddPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddPaymentModal({ isOpen, onClose }: AddPaymentModalProps) {
	const { parties, addTransaction } = useStore();
	const [supplierId, setSupplierId] = useState('');
	const [amount, setAmount] = useState<number | ''>('');
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
	const [paymentMode, setPaymentMode] = useState<'Cash' | 'Cheque'>('Cash');
	const [notes, setNotes] = useState('');

	// Filter suppliers
	const suppliers = useMemo(() => parties.filter(p => p.type === 'Supplier'), [parties]);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setSupplierId('');
			setAmount('');
			setDate(new Date().toISOString().split('T')[0]);
			setPaymentMode('Cash');
			setNotes('');
		}
	}, [isOpen]);

	const handleSubmit = () => {
		// Validation
		if (!supplierId) {
			toast.error('Please select a supplier');
			return;
		}
		if (!amount || amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		try {
			const supplier = parties.find(p => p.id === supplierId);
			
			addTransaction({
				date: new Date(date).toISOString(),
				type: 'Payment',
				quantity: 1, // Dummy quantity
				unitPrice: Number(amount), // Amount goes here
				partyId: supplierId,
				partyName: supplier?.name,
				notes: `${paymentMode} - ${notes}`,
				// Required fields that will be ignored/overwritten by store logic for Payment
				billNo: '',
				debit: 0,
				credit: 0,
				total: 0
			});

			toast.success('Payment recorded successfully');
			onClose();
		} catch (error) {
			toast.error('Failed to save payment');
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				<div className="mb-6">
					<h3 className="text-xl font-bold text-slate-900">Record Payment</h3>
					<p className="text-sm text-slate-600 mt-1">Record payment to supplier</p>
				</div>

				{/* Form */}
				<div className="space-y-4">
					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">
							Supplier <span className="text-red-500">*</span>
						</label>
						<select
							className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							value={supplierId}
							onChange={e => setSupplierId(e.target.value)}
						>
							<option value="">Select Supplier...</option>
							{suppliers.map(s => (
								<option key={s.id} value={s.id}>{s.name}</option>
							))}
						</select>
					</div>

					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">
							Date <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							value={date}
							onChange={e => setDate(e.target.value)}
						/>
					</div>

					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">
							Amount (Rs.) <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							min="0"
							step="0.01"
							className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							value={amount}
							onChange={e => setAmount(Number(e.target.value))}
							placeholder="0.00"
						/>
					</div>

					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">
							Payment Mode
						</label>
						<div className="flex gap-4">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="paymentMode"
									value="Cash"
									checked={paymentMode === 'Cash'}
									onChange={() => setPaymentMode('Cash')}
									className="text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-sm text-slate-700">Cash</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="paymentMode"
									value="Cheque"
									checked={paymentMode === 'Cheque'}
									onChange={() => setPaymentMode('Cheque')}
									className="text-indigo-600 focus:ring-indigo-500"
								/>
								<span className="text-sm text-slate-700">Cheque</span>
							</label>
						</div>
					</div>

					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">
							Notes / Cheque No.
						</label>
						<input
							type="text"
							className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							value={notes}
							onChange={e => setNotes(e.target.value)}
							placeholder={paymentMode === 'Cheque' ? "Enter Cheque Number" : "Optional notes"}
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors"
					>
						Save Payment
					</button>
				</div>
			</div>
		</div>
	);
}
