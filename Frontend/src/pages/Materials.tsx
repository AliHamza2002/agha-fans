import { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store/store';
import type { Material, MaterialCategory, UnitType } from '../store/store';
import { Plus, Trash2, Pencil, Layers3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { Loader, EmptyState } from '../components/Loader';

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
	const { materials, addMaterial, updateMaterial, removeMaterial, parties, fetchMaterials, isLoadingMaterials } = useStore();
	const { user } = useAuth();
	const [tab, setTab] = useState<MaterialCategory>('Raw');

	// Fetch materials on mount
	useEffect(() => {
		fetchMaterials();
	}, [fetchMaterials]);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<Omit<Material, 'id'>>({ name: '', category: 'Raw', unit: 'kg', quantity: 0, unitPrice: 0, description: '', lowStockThreshold: 0 });
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; materialId: string; materialName: string }>({ open: false, materialId: '', materialName: '' });
	
	// Company and items state
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
	const [selectedItems, setSelectedItems] = useState<SelectedCompanyItem[]>([{ id: 1, itemName: '', itemPrice: 0 }]);

	const isStoreBoy = user?.role === 'StoreBoy';
	const isAdmin = user?.role === 'Admin';
	const availableCategories: MaterialCategory[] = isStoreBoy ? ['Raw', 'Semi-Finished'] : ['Raw', 'Semi-Finished', 'Final'];
	
	const filtered = useMemo(() => materials.filter(m => m.category === tab), [materials, tab]);
	
	// *** FEATURE: Get available items for selected company from database ***
	const availableCompanyItems = useMemo(() => {
		if (!selectedCompanyId) return [];
		const party = parties.find(p => p.id === selectedCompanyId);
		if (!party) return [];
		
		// Return actual items from party (stored in database)
		if (party.items && party.items.length > 0) {
			return party.items.map((item, index) => ({
				id: index + 1,
				itemName: item.itemName,
				itemPrice: item.itemPrice
			}));
		}
		
		return [];
	}, [selectedCompanyId, parties]);
	
	// *** FIX: When item is selected, update material name and price ***
	// *** ROLE-BASED: StoreBoy gets price 0, Admin gets actual price ***
	const updateSelectedItem = (id: number, itemName: string) => {
		const companyItem = availableCompanyItems.find(ci => ci.itemName === itemName);
		setSelectedItems(selectedItems.map(item => 
			item.id === id 
				? { ...item, itemName, itemPrice: companyItem?.itemPrice || 0 } 
				: item
		));
		
		// *** FIX: Update form with selected item's name and price ***
		// *** ROLE-BASED: StoreBoy always gets unitPrice 0, Admin gets actual price ***
		if (companyItem) {
			setForm({ 
				...form, 
				name: companyItem.itemName,
				unitPrice: isStoreBoy ? 0 : companyItem.itemPrice 
			});
		}
	};
	
	const handleCompanyChange = (companyId: string) => {
		setSelectedCompanyId(companyId);
		// Reset items when company changes
		setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
	};

	// *** ERROR HANDLING: Async function to properly catch API errors ***
	async function submit() {
		// *** FIX: For new materials, require company and item selection ***
		if (!editingId) {
			if (!selectedCompanyId) {
				toast.error('Please select a company');
				return;
			}
			
			if (!form.name.trim()) {
				toast.error('Please select an item from the company');
				return;
			}
		} else {
			// For editing, just ensure name exists
			if (!form.name.trim()) {
				toast.error('Material name is required');
				return;
			}
		}
		
		try {
			if (editingId) {
				await updateMaterial(editingId, form);
				toast.success('Material updated successfully');
			} else {
				await addMaterial(form);
				toast.success('Material added successfully');
			}
			setOpen(false);
			setEditingId(null);
			setForm({ name: '', category: tab, unit: 'kg', quantity: 0, unitPrice: 0, description: '', lowStockThreshold: 0 });
			setSelectedCompanyId('');
			setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		} catch (error: any) {
			// *** ERROR HANDLING: Show actual API error message ***
			toast.error(error.message || 'Failed to save material');
		}
	}

	// *** ERROR HANDLING: Async function to properly catch API errors ***
	async function handleDelete() {
		try {
			await removeMaterial(deleteDialog.materialId);
			toast.success('Material deleted successfully');
		} catch (error: any) {
			// *** ERROR HANDLING: Show actual API error message ***
			toast.error(error.message || 'Failed to delete material');
		} finally {
			setDeleteDialog({ open: false, materialId: '', materialName: '' });
		}
	}

	function openEdit(m: Material) {
		setEditingId(m.id);
		setForm({ name: m.name, category: m.category, unit: m.unit, quantity: m.quantity, unitPrice: m.unitPrice, description: m.description, lowStockThreshold: m.lowStockThreshold });
		setSelectedCompanyId('');
		setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		setOpen(true);
	}
	
	function openAdd() {
		setEditingId(null);
		setForm({ name: '', category: tab, unit: 'kg', quantity: 0, unitPrice: 0, description: '', lowStockThreshold: 0 });
		setSelectedCompanyId('');
		setSelectedItems([{ id: 1, itemName: '', itemPrice: 0 }]);
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

			{/* *** LOADING STATE *** */}
			{isLoadingMaterials ? (
				<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200">
					<Loader message="Loading materials..." />
				</div>
			) : filtered.length === 0 ? (
				<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200">
					<EmptyState 
						icon={Layers3}
						title={`No ${tab} materials yet`}
						description="Get started by adding your first material to the inventory."
						action={
							<button 
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" 
								onClick={openAdd}
							>
								<Plus className="h-4 w-4" /> Add Material
							</button>
						}
					/>
				</div>
			) : (
				<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200 overflow-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-center text-slate-600 border-b border-slate-200">
								<th className="p-3 font-semibold">Name</th>
								<th className="p-3 font-semibold">Category</th>
								<th className="p-3 font-semibold">Unit</th>
								<th className="p-3 font-semibold">Qty</th>
								{/* *** ROLE-BASED: Only show price columns for Admin *** */}
								{isAdmin && <th className="p-3 font-semibold">Unit Price</th>}
								{isAdmin && <th className="p-3 font-semibold">Total Value</th>}
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
									{/* *** ROLE-BASED: Only show price columns for Admin *** */}
									{isAdmin && <td className="p-3 text-slate-600 text-center">Rs. {(m.unitPrice || 0).toLocaleString()}</td>}
									{isAdmin && <td className="p-3 font-semibold text-slate-900 text-center">Rs. {((m.unitPrice || 0) * m.quantity).toLocaleString()}</td>}
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
			)}

			<Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Material' : 'Add Material'}>
				<div className="space-y-4">
					{/* Material Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* *** FIX: Name field removed - will be set from selected item *** */}
					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">Category</label>
						<select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as MaterialCategory })}>
							{availableCategories.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">Unit</label>
						<select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as UnitType })}>
							<option>kg</option>
							<option>pcs</option>
						</select>
					</div>
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Quantity</label>
							<input type="number" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
						</div>
						{/* *** ROLE-BASED: Unit Price field only for Admin *** */}
						{isAdmin && (
							<div>
								<label className="text-xs font-medium text-slate-700 mb-1 block">Unit Price (Rs.)</label>
								<input 
									type="number" 
									className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
									value={form.unitPrice} 
									onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} 
								/>
							</div>
						)}
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
					{/* *** FIX: Company selection is required for new materials *** */}
					<div className="border-t border-slate-200 pt-4">
						<div className="mb-4">
							<label className="text-sm font-semibold text-slate-900 mb-2 block">
								Company & Items {!editingId && <span className="text-red-500">*</span>}
								{editingId && <span className="text-xs font-normal text-slate-500">(Optional for editing)</span>}
							</label>
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

						{/* *** FIX: Simplified to single item selection *** */}
						{selectedCompanyId && (
							<div>
								<div className="mb-3">
									<label className="text-xs font-medium text-slate-700 mb-1 block">
										Select Item <span className="text-red-500">*</span>
									</label>
									<select
										className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9"
										value={selectedItems[0]?.itemName || ''}
										onChange={e => updateSelectedItem(selectedItems[0]?.id || 1, e.target.value)}
									>
										<option value="">-- Select an item --</option>
										{availableCompanyItems.map(companyItem => (
											<option key={companyItem.id} value={companyItem.itemName}>
												{companyItem.itemName}{isAdmin ? ` - Rs. ${companyItem.itemPrice}` : ''}
											</option>
										))}
									</select>
								</div>
								
								{/* *** FIX: Show selected item details *** */}
								{/* *** ROLE-BASED: Show price only for Admin *** */}
								{form.name && (
									<div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
										<div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
											<div>
												<span className="text-xs text-slate-600">Item Name:</span>
												<p className="font-semibold text-slate-900">{form.name}</p>
											</div>
											{isAdmin && (
												<div>
													<span className="text-xs text-slate-600">Unit Price:</span>
													<p className="font-semibold text-slate-900">Rs. {form.unitPrice?.toLocaleString() || 0}</p>
												</div>
											)}
										</div>
									</div>
								)}
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


