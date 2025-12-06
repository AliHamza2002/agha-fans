import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/store';
import { toast } from './Toast';

interface AddReceiptModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddReceiptModal({ isOpen, onClose }: AddReceiptModalProps) {
	const { parties, addTransaction } = useStore();
	const [buyerId, setBuyerId] = useState('');
	const [amount, setAmount] = useState<number | ''>('');
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
	const [paymentMode, setPaymentMode] = useState<'Cash' | 'Cheque'>('Cash');
	const [notes, setNotes] = useState('');

	// Filter buyers
	const buyers = useMemo(() => parties.filter(p => p.type === 'Buyer'), [parties]);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setBuyerId('');
			setAmount('');
			setDate(new Date().toISOString().split('T')[0]);
			setPaymentMode('Cash');
			setNotes('');
		}
	}, [isOpen]);

	const handleSubmit = () => {
		// Validation
		if (!buyerId) {
			toast.error('Please select a buyer');
			return;
		}
		if (!amount || amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		try {
			const buyer = parties.find(p => p.id === buyerId);
			
			addTransaction({
				date: new Date(date).toISOString(),
				type: 'Receipt',
				quantity: 1, // Dummy quantity
				unitPrice: Number(amount), // Amount goes here
				partyId: buyerId,
				partyName: buyer?.name,
				notes: `${paymentMode} - ${notes}`,
			});

			toast.success('Receipt recorded successfully');
			onClose();
		} catch (error: any) {
			// *** ERROR HANDLING: Show actual API error message ***
			toast.error(error.message || 'Failed to save receipt');
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
					<h3 className="text-xl font-bold text-slate-900">Record Receipt</h3>
					<p className="text-sm text-slate-600 mt-1">Record payment received from buyer</p>
				</div>

				{/* Form */}
				<div className="space-y-4">
				<div>
					<label className="text-xs font-medium text-slate-700 mb-1 block">
						Buyer <span className="text-red-500">*</span>
					</label>
					<select
						className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9"
						value={buyerId}
						onChange={e => setBuyerId(e.target.value)}
					>
						<option value="">Select Buyer...</option>
						{buyers.map(b => (
							<option key={b.id} value={b.id}>{b.name}</option>
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
						Save Receipt
					</button>
				</div>
			</div>
		</div>
	);
}
