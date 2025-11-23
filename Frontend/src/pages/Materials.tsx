import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import type { Material, MaterialCategory, UnitType } from '../store/store';
import { Plus, Trash2, Pencil, Layers3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';

interface SelectedCompanyItem {
	id: number;
	itemName: string;
	itemPrice: number;
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
	return (
		<button onClick={onClick} className={`px-4 py-2.5 rounded-xl font-medium transition-all ${active ? 'bg-brand text-white shadow-md' : 'bg-white text-slate-600 border border-slate-300 hover:bg-indigo-50 hover:text-indigo-600'}`}>{label}</button>
	);
}

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200">
				<div className="p-5 border-b border-slate-200 font-bold text-lg text-slate-900">{title}</div>
				<div className="p-5 space-y-4">{children}</div>
				<div className="p-5 border-t border-slate-200 text-right">
					<button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-medium text-slate-700" onClick={onClose}>Close</button>
				</div>
			</div>
		</div>
	);
}

export default function Materials() {
	const { materials, addMaterial, updateMaterial, removeMaterial, parties } = useStore();
	const { user } = useAuth();
	const [tab, setTab] = useState<MaterialCategory>('Raw');
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<Omit<Material, 'id'>>({ name: '', category: 'Raw', unit: 'kg', quantity: 0, unitPrice: 0, description: '', lowStockThreshold: 0 });
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; materialId: string; materialName: string }>({ open: false, materialId: '', materialName: '' });
	
	// Company and items state
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
	const [selectedItems, setSelectedItems] = useState<SelectedCompanyItem[]>([{ id: 1, itemName: '', itemPrice: 0 }]);
	const [nextItemId, setNextItemId] = useState(2);

	const isStoreBoy = user?.role === 'StoreBoy';
	const availableCategories: MaterialCategory[] = isStoreBoy ? ['Raw', 'Semi-Finished'] : ['Raw', 'Semi-Finished', 'Final'];
	
	const filtered = useMemo(() => materials.filter(m => m.category === tab), [materials, tab]);
	
	// Get available items for selected company
	const availableCompanyItems = useMemo(() => {
		if (!selectedCompanyId) return [];
		// In real app, get items from party data
		// For demo, return mock items based on company
		const party = parties.find(p => p.id === selectedCompanyId);
		if (!party) return [];
		
		// Mock items for demo (would come from party.items in real implementation)
		return [
			{ id: 1, itemName: `${party.name} - Item 1`, itemPrice: 100 },
			{ id: 2, itemName: `${party.name} - Item 2`, itemPrice: 200 },
			{ id: 3, itemName: `${party.name} - Item 3`, itemPrice: 300 },
		];
	}, [selectedCompanyId, parties]);
	
	const addItemRow = () => {
		setSelectedItems([...selectedItems, { id: nextItemId, itemName: '', itemPrice: 0 }]);
		setNextItemId(nextItemId + 1);
	};
	
	const removeItemRow = (id: number) => {
		if (selectedItems.length > 1) {
			setSelectedItems(selectedItems.filter(item => item.id !== id));
		}
	};
	
	const updateSelectedItem = (id: number, itemName: string) => {
		const companyItem = availableCompanyItems.find(ci => ci.itemName === itemName);
		setSelectedItems(selectedItems.map(item => 
			item.id === id 
				? { ...item, itemName, itemPrice: companyItem?.itemPrice || 0 } 
				: item
		));
	};
	
	const handleCompanyChange = (companyId: string) => {
		setSelectedCompanyId(companyId);
		// Reset items when company changes
		setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		setNextItemId(2);
	};

	function submit() {
		if (!form.name.trim()) {
			toast.error('Material name is required');
			return;
		}
		
		// Validate company and items if provided
		if (selectedCompanyId) {
			const itemsWithData = selectedItems.filter(item => item.itemName.trim() || item.itemPrice > 0);
			if (itemsWithData.length === 0) {
				toast.error('Please select at least one item from the company');
				return;
			}
			
			const hasIncompleteItems = itemsWithData.some(item => !item.itemName.trim());
			if (hasIncompleteItems) {
				toast.error('Please complete all item selections or remove empty rows');
				return;
			}
		}
		
		try {
			if (editingId) {
				updateMaterial(editingId, form);
				toast.success('Material updated successfully');
			} else {
				addMaterial(form);
				toast.success('Material added successfully');
			}
			setOpen(false);
			setEditingId(null);
			setForm({ name: '', category: tab, unit: 'kg', quantity: 0, unitPrice: 0, description: '', lowStockThreshold: 0 });
			setSelectedCompanyId('');
			setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
			setNextItemId(2);
		} catch (error) {
			toast.error('Failed to save material');
		}
	}

	function handleDelete() {
		try {
			removeMaterial(deleteDialog.materialId);
			toast.success('Material deleted successfully');
		} catch (error) {
			toast.error('Failed to delete material');
		}
	}

	function openEdit(m: Material) {
		setEditingId(m.id);
		setForm({ name: m.name, category: m.category, unit: m.unit, quantity: m.quantity, unitPrice: m.unitPrice, description: m.description, lowStockThreshold: m.lowStockThreshold });
		setSelectedCompanyId('');
		setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		setNextItemId(2);
		setOpen(true);
	}
	
	function openAdd() {
		setEditingId(null);
		setForm({ name: '', category: tab, unit: 'kg', quantity: 0, unitPrice: 0, description: '', lowStockThreshold: 0 });
		setSelectedCompanyId('');
		setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		setNextItemId(2);
		setOpen(true);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2"><Layers3 className="h-6 w-6 text-indigo-600" /> Materials</h1>
				<button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" onClick={openAdd}>
					<Plus className="h-4 w-4" /> Add Material
				</button>
			</div>

			<div className="flex gap-2">
				{availableCategories.map(c => (
					<Tab key={c} label={c} active={tab===c} onClick={() => setTab(c)} />
				))}
			</div>

			<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200 overflow-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-center text-slate-600 border-b border-slate-200">
							<th className="p-3 font-semibold">Name</th>
							<th className="p-3 font-semibold">Category</th>
							<th className="p-3 font-semibold">Unit</th>
							<th className="p-3 font-semibold">Qty</th>
							<th className="p-3 font-semibold">Unit Price</th>
							<th className="p-3 font-semibold">Total Value</th>
							<th className="p-3 font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map(m => (
							<tr key={m.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
								<td className="p-3 font-semibold text-slate-900 text-center">{m.name}</td>
								<td className="p-3 text-center"><span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{m.category}</span></td>
								<td className="p-3 text-slate-600 text-center">{m.unit}</td>
								<td className="p-3 font-medium text-slate-900 text-center">{m.quantity.toLocaleString()}</td>
								<td className="p-3 text-slate-600 text-center">Rs. {(m.unitPrice || 0).toLocaleString()}</td>
								<td className="p-3 font-semibold text-slate-900 text-center">Rs. {((m.unitPrice || 0) * m.quantity).toLocaleString()}</td>
								<td className="p-3 justify-center text-center">
									<div className="flex gap-2 justify-center">
										<button className="px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 transition" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></button>
										<button className="px-2 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition" onClick={() => setDeleteDialog({ open: true, materialId: m.id, materialName: m.name })}><Trash2 className="h-4 w-4" /></button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Material' : 'Add Material'}>
				<div className="space-y-4">
					{/* Material Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Name</label>
							<input className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Category</label>
							<select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as MaterialCategory })}>
								{availableCategories.map(cat => (
									<option key={cat} value={cat}>{cat}</option>
								))}
							</select>
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Unit</label>
							<select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as UnitType })}>
								<option>kg</option>
								<option>pcs</option>
							</select>
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Quantity</label>
							<input type="number" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Unit Price (Rs.)</label>
							<input type="number" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.unitPrice || 0} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })} />
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Low Stock Threshold</label>
							<input type="number" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.lowStockThreshold ?? 0} onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
						</div>
						<div className="md:col-span-2">
							<label className="text-xs font-medium text-slate-700 mb-1 block">Description</label>
							<textarea className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
						</div>
					</div>

					{/* Company Selection & Items */}
					<div className="border-t border-slate-200 pt-4">
						<div className="mb-4">
							<label className="text-sm font-semibold text-slate-900 mb-2 block">Company & Items (Optional)</label>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Select Company</label>
							<select
								className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={selectedCompanyId}
								onChange={e => handleCompanyChange(e.target.value)}
							>
								<option value="">-- Select a company --</option>
								{parties.map(party => (
									<option key={party.id} value={party.id}>
										{party.name} ({party.type})
									</option>
								))}
							</select>
						</div>

						{selectedCompanyId && (
							<div>
								<div className="flex items-center justify-between mb-3">
									<label className="text-xs font-medium text-slate-700">Company Items</label>
									<button
										type="button"
										onClick={addItemRow}
										className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
									>
										<Plus className="h-3 w-3" /> Add Item
									</button>
								</div>

								<div className="space-y-3">
									{selectedItems.map((item) => (
										<div key={item.id} className="flex gap-2 items-start">
											<div className="flex-1">
												<label className="text-xs font-medium text-slate-600 mb-1 block">
													Item Name
												</label>
												<select
													className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
													value={item.itemName}
													onChange={e => updateSelectedItem(item.id, e.target.value)}
												>
													<option value="">Select item...</option>
													{availableCompanyItems.map(companyItem => (
														<option key={companyItem.id} value={companyItem.itemName}>
															{companyItem.itemName}
														</option>
													))}
												</select>
											</div>

											<div className="w-32">
												<label className="text-xs font-medium text-slate-600 mb-1 block">
													Price (Rs.)
												</label>
												<input
													type="number"
													disabled
													className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 text-sm cursor-not-allowed"
													value={item.itemPrice || 0}
													readOnly
												/>
											</div>

											{selectedItems.length > 1 && (
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
						)}
					</div>
				</div>

				<div className="pt-4 text-right">
					<button className="px-5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" onClick={submit}>{editingId ? 'Save Changes' : 'Add Material'}</button>
				</div>
			</Modal>

			<ConfirmDeleteDialog
				isOpen={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, materialId: '', materialName: '' })}
				onConfirm={handleDelete}
				itemName={deleteDialog.materialName}
				message="Are you sure you want to delete"
			/>
		</div>
	);
}


