import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/store';
import { toast } from './Toast';

interface AddPurchaseModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ItemRow {
	id: number;
	materialId: string;
	quantity: number;
	unitPrice: number;
}

export function AddPurchaseModal({ isOpen, onClose }: AddPurchaseModalProps) {
	const { parties, materials, addTransaction } = useStore();
	const [supplierId, setSupplierId] = useState('');
	const [items, setItems] = useState<ItemRow[]>([{ id: 1, materialId: '', quantity: 1, unitPrice: 0 }]);
	const [nextId, setNextId] = useState(2);
	const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
	const [notes, setNotes] = useState('');

	// Filter suppliers
	const suppliers = useMemo(() => parties.filter(p => p.type === 'Supplier'), [parties]);
	
	// Filter raw materials
	const rawMaterials = useMemo(() => materials.filter(m => m.category === 'Raw' || m.category === 'Semi-Finished'), [materials]);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setSupplierId('');
			setItems([{ id: 1, materialId: '', quantity: 1, unitPrice: 0 }]);
			setNextId(2);
			setBillDate(new Date().toISOString().split('T')[0]);
			setNotes('');
		}
	}, [isOpen]);

	const addItemRow = () => {
		setItems([...items, { id: nextId, materialId: '', quantity: 1, unitPrice: 0 }]);
		setNextId(nextId + 1);
	};

	const removeItemRow = (id: number) => {
		if (items.length > 1) {
			setItems(items.filter(item => item.id !== id));
		}
	};

	const updateItem = (id: number, field: keyof ItemRow, value: string | number) => {
		setItems(items.map(item => {
			if (item.id === id) {
				if (field === 'materialId') {
					// When material changes, update unit price to current material price
					const material = materials.find(m => m.id === value);
					return { ...item, [field]: String(value), unitPrice: material?.unitPrice || 0 };
				}
				return { ...item, [field]: value };
			}
			return item;
		}));
	};

	const calculateTotal = () => {
		return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
	};

	const handleSubmit = () => {
		// Validation
		if (!supplierId) {
			toast.error('Please select a supplier');
			return;
		}

		// Validate items
		const validItems = items.filter(item => item.materialId && item.quantity > 0 && item.unitPrice > 0);
		if (validItems.length === 0) {
			toast.error('Please add at least one valid item');
			return;
		}

		// Check for incomplete items
		const hasIncompleteItems = items.some(item => 
			(item.materialId && (item.quantity <= 0 || item.unitPrice <= 0)) || 
			(!item.materialId && (item.quantity > 0 || item.unitPrice > 0))
		);
		if (hasIncompleteItems) {
			toast.error('Please complete all item entries or remove empty rows');
			return;
		}

		try {
			const supplier = parties.find(p => p.id === supplierId);
			
			// Add a transaction for each item
			validItems.forEach(item => {
				const material = materials.find(m => m.id === item.materialId);
				if (material) {
						addTransaction({
						date: new Date(billDate).toISOString(),
						materialId: item.materialId,
						type: 'Purchase',
						quantity: item.quantity,
						unitPrice: item.unitPrice,
						partyId: supplierId,
						partyName: supplier?.name,
						notes: notes || undefined,
					});
				}
			});

			toast.success('Purchase recorded successfully');
			onClose();
		} catch (error) {
			toast.error('Failed to save purchase');
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				<div className="mb-6">
					<h3 className="text-xl font-bold text-slate-900">Record New Purchase</h3>
					<p className="text-sm text-slate-600 mt-1">Enter purchase details from supplier</p>
				</div>

				{/* Form */}
				<div className="space-y-4">
					{/* Purchase Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								value={billDate}
								onChange={e => setBillDate(e.target.value)}
							/>
						</div>

						<div className="md:col-span-2">
							<label className="text-xs font-medium text-slate-700 mb-1 block">Notes</label>
							<input
								type="text"
								className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={notes}
								onChange={e => setNotes(e.target.value)}
								placeholder="Optional notes (e.g. Bill Number, Remarks)"
							/>
						</div>
					</div>

					{/* Items Section */}
					<div className="border-t border-slate-200 pt-4 mt-4">
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-semibold text-slate-900">
								Items <span className="text-red-500">*</span>
							</label>
							<button
								type="button"
								onClick={addItemRow}
								className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
							>
								<Plus className="h-3 w-3" /> Add Item
							</button>
						</div>

						<div className="space-y-3">
							{items.map((item) => (
								<div key={item.id} className="flex gap-2 items-start">
									<div className="flex-1">
										<label className="text-xs font-medium text-slate-600 mb-1 block">
											Material
										</label>
										<select
											className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
											value={item.materialId}
											onChange={e => updateItem(item.id, 'materialId', e.target.value)}
										>
											<option value="">Select material...</option>
											{rawMaterials.map(m => (
												<option key={m.id} value={m.id}>
													{m.name} ({m.unit})
												</option>
											))}
										</select>
									</div>

									<div className="w-24">
										<label className="text-xs font-medium text-slate-600 mb-1 block">
											Qty
										</label>
										<input
											type="number"
											min="1"
											className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
											value={item.quantity || ''}
											onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
											placeholder="1"
										/>
									</div>

									<div className="w-32">
										<label className="text-xs font-medium text-slate-600 mb-1 block">
											Unit Price
										</label>
										<input
											type="number"
											min="0"
											step="0.01"
											className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
											value={item.unitPrice || ''}
											onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
											placeholder="0.00"
										/>
									</div>

									<div className="w-32 pt-7 text-right font-medium text-slate-700">
										Rs. {(item.quantity * item.unitPrice).toLocaleString()}
									</div>

									{items.length > 1 && (
										<button
											type="button"
											onClick={() => removeItemRow(item.id)}
											className="mt-6 p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
											title="Remove item"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Total */}
					<div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium text-slate-700">Total Amount:</span>
							<span className="text-xl font-bold text-indigo-600">
								Rs. {calculateTotal().toLocaleString()}
							</span>
						</div>
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
						Save Purchase
					</button>
				</div>
			</div>
		</div>
	);
}
