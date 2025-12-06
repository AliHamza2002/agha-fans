import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Material } from '../store/store';
import type { LocalBuyerData } from '../contexts/LocalBuyerContext';
import { toast } from './Toast';

interface AddBuyerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (buyerData: LocalBuyerData) => void;
	finishedMaterials: Material[];
}

interface ItemRow {
	id: number;
	itemName: string;
	itemPrice: number;
	quantity: number;
}

export function AddBuyerModal({ isOpen, onClose, onSave, finishedMaterials }: AddBuyerModalProps) {
	const [buyerName, setBuyerName] = useState('');
	const [contact, setContact] = useState('');
	const [address, setAddress] = useState('');
	const [items, setItems] = useState<ItemRow[]>([{ id: 1, itemName: '', itemPrice: 0, quantity: 1 }]);
	const [nextId, setNextId] = useState(2);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setBuyerName('');
			setContact('');
			setAddress('');
			setItems([{ id: 1, itemName: finishedMaterials[0]?.name || '', itemPrice: 0, quantity: 1 }]);
			setNextId(2);
		}
	}, [isOpen, finishedMaterials]);

	const addItemRow = () => {
		setItems([...items, { id: nextId, itemName: '', itemPrice: 0, quantity: 1 }]);
		setNextId(nextId + 1);
	};

	const removeItemRow = (id: number) => {
		if (items.length > 1) {
			setItems(items.filter(item => item.id !== id));
		}
	};

	const updateItem = (id: number, field: 'itemName' | 'itemPrice' | 'quantity', value: string | number) => {
		setItems(items.map(item => 
			item.id === id ? { ...item, [field]: value } : item
		));
	};

	const calculateTotal = () => {
		return items.reduce((sum, item) => sum + ((item.itemPrice || 0) * (item.quantity || 0)), 0);
	};

	const handleSubmit = () => {
		// Validation
		if (!buyerName.trim()) {
			toast.error('Buyer name is required');
			return;
		}

		// Validate items
		const validItems = items.filter(item => item.itemName.trim() && item.itemPrice > 0 && item.quantity > 0);
		if (validItems.length === 0) {
			toast.error('Please add at least one item with name and price');
			return;
		}

		// Check for incomplete items
		const hasIncompleteItems = items.some(item => 
			(item.itemName.trim() && item.itemPrice <= 0) || 
			(!item.itemName.trim() && item.itemPrice > 0)
		);
		if (hasIncompleteItems) {
			toast.error('Please complete all item entries or remove empty rows');
			return;
		}

		const buyerData: LocalBuyerData = {
			buyerName: buyerName.trim(),
			contact: contact.trim() || undefined,
			address: address.trim() || undefined,
			items: validItems.map(item => ({
				itemName: item.itemName.trim(),
				itemPrice: item.itemPrice,
				quantity: item.quantity,
			})),
			totalAmount: calculateTotal(),
			date: new Date().toISOString(),
		};

		onSave(buyerData);
		toast.success('Buyer added successfully');
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 animate-scale-in">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Header */}
				<div className="mb-6">
					<h3 className="text-xl font-bold text-slate-900">Add New Local Buyer</h3>
					<p className="text-sm text-slate-600 mt-1">Enter buyer details and select finished material</p>
				</div>

				{/* Form */}
				<div className="space-y-4">
					{/* Buyer Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="md:col-span-2">
							<label className="text-xs font-medium text-slate-700 mb-1 block">
								Buyer Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={buyerName}
								onChange={e => setBuyerName(e.target.value)}
								placeholder="Enter buyer name"
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Contact</label>
							<input
								type="text"
								className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={contact}
								onChange={e => setContact(e.target.value)}
								placeholder="Phone or email"
							/>
						</div>

						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Address</label>
							<input
								type="text"
								className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={address}
								onChange={e => setAddress(e.target.value)}
								placeholder="Buyer address"
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
											Item Name
										</label>
								<select
									className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9"
									value={item.itemName}
									onChange={e => updateItem(item.id, 'itemName', e.target.value)}
								>
									<option value="">Select item...</option>
									{finishedMaterials.map(material => (
										<option key={material.id} value={material.name}>
											{material.name}
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

									<div className="flex-1">
										<label className="text-xs font-medium text-slate-600 mb-1 block">
											Item Price (Rs.)
										</label>
										<input
											type="number"
											min="0"
											step="0.01"
											className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
											value={item.itemPrice || ''}
											onChange={e => updateItem(item.id, 'itemPrice', Number(e.target.value))}
											placeholder="0.00"
										/>
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
						disabled={finishedMaterials.length === 0}
						className="px-6 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Save & Generate Receipt
					</button>
				</div>
			</div>
		</div>
	);
}


