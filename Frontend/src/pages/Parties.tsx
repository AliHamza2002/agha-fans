import { useState } from 'react';
import type { Party, PartyType } from '../store/store';
import { useStore } from '../store/store';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from '../components/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { useAuth } from '../contexts/AuthContext';

interface PartyItem {
	id: number;
	itemName: string;
	itemPrice: number;
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

export default function Parties() {
	const { parties, addParty, updateParty, removeParty, transactions } = useStore();
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<Omit<Party, 'id'>>({ name: '', type: 'Buyer', contact: '' });
	const [items, setItems] = useState<PartyItem[]>([{ id: 1, itemName: '', itemPrice: 0 }]);
	const [nextId, setNextId] = useState(2);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; partyId: string; partyName: string }>({ open: false, partyId: '', partyName: '' });

	const isAdmin = user?.role === 'Admin';

	const addItemRow = () => {
		setItems([...items, { id: nextId, itemName: '', itemPrice: 0 }]);
		setNextId(nextId + 1);
	};

	const removeItemRow = (id: number) => {
		if (items.length > 1) {
			setItems(items.filter(item => item.id !== id));
		}
	};

	const updateItem = (id: number, field: 'itemName' | 'itemPrice', value: string | number) => {
		setItems(items.map(item => 
			item.id === id ? { ...item, [field]: value } : item
		));
	};

	function submit() {
		if (!form.name.trim()) {
			toast.error('Party name is required');
			return;
		}

		// Validate items - only check if any items have data
		const itemsWithData = items.filter(item => item.itemName.trim() || item.itemPrice > 0);
		if (itemsWithData.length > 0) {
			const hasIncompleteItems = itemsWithData.some(item => 
				!item.itemName.trim() || item.itemPrice <= 0
			);
			if (hasIncompleteItems) {
				toast.error('Please complete all item entries or remove empty rows');
				return;
			}
		}

		try {
			// For now, just save party info (items can be stored in extended party data later)
			if (editingId) {
				updateParty(editingId, form);
				toast.success('Party updated successfully');
			} else {
				addParty(form);
				toast.success('Party added successfully');
			}
			setOpen(false);
			setEditingId(null);
			setForm({ name: '', type: 'Buyer', contact: '' });
			setItems([{ id: 1, itemName: '', itemPrice: 0 }]);
			setNextId(2);
		} catch (error) {
			toast.error('Failed to save party');
		}
	}

	function handleDelete() {
		try {
			removeParty(deleteDialog.partyId);
			toast.success('Party deleted successfully');
		} catch (error) {
			toast.error('Failed to delete party');
		}
	}

	function openEdit(p: Party) {
		setEditingId(p.id);
		setForm({ name: p.name, type: p.type, contact: p.contact });
		setItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		setNextId(2);
		setOpen(true);
	}

	function openAdd() {
		setEditingId(null);
		setForm({ name: '', type: 'Buyer', contact: '' });
		setItems([{ id: 1, itemName: '', itemPrice: 0 }]);
		setNextId(2);
		setOpen(true);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900text-slate-100">Parties</h1>
				<button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" onClick={openAdd}>
					<Plus className="h-4 w-4" /> Add Party
				</button>
			</div>

			<div className="bg-whitebg-slate-800 rounded-2xl p-5 shadow-soft border border-slate-200border-slate-700 overflow-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-left text-slate-600text-slate-400 border-b border-slate-200border-slate-700">
							<th className="p-3 font-semibold">Name</th>
							<th className="p-3 font-semibold">Type</th>
							<th className="p-3 font-semibold">Contact</th>
							<th className="p-3 font-semibold">Total Transactions</th>
							<th className="p-3 font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{parties.map(p => {
							const count = transactions.filter(t => t.partyId === p.id).length;
							return (
								<tr key={p.id} className="border-b border-slate-100border-slate-700 hover:bg-indigo-50/50hover:bg-indigo-900/20 transition">
									<td className="p-3 font-semibold text-slate-900text-slate-100">{p.name}</td>
									<td className="p-3">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${p.type === 'Supplier' ? 'bg-blue-100bg-blue-900/50 text-blue-700text-blue-300' : 'bg-emerald-100bg-emerald-900/50 text-emerald-700text-emerald-300'}`}>
											{p.type}
										</span>
									</td>
									<td className="p-3 text-slate-600text-slate-400">{p.contact ?? '-'}</td>
									<td className="p-3 font-medium text-slate-900text-slate-100">{count}</td>
									<td className="p-3">
										<div className="flex gap-2">
											<button className="px-2 py-1.5 rounded-lg border border-slate-300border-slate-600 hover:bg-indigo-50hover:bg-indigo-900/30 hover:border-indigo-300hover:border-indigo-600 text-indigo-600text-indigo-400 transition" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></button>
											<button className="px-2 py-1.5 rounded-lg border border-red-200border-red-800 hover:bg-red-50hover:bg-red-900/30 text-red-600text-red-400 transition" onClick={() => setDeleteDialog({ open: true, partyId: p.id, partyName: p.name })}><Trash2 className="h-4 w-4" /></button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Party' : 'Add Party'}>
				<div className="space-y-4">
					{/* Party Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="md:col-span-2">
							<label className="text-xs font-medium text-slate-700text-slate-300 mb-1 block">Name</label>
							<input className="w-full px-3 py-2.5 border border-slate-300border-slate-600bg-slate-700text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700text-slate-300 mb-1 block">Type</label>
							<select className="w-full px-3 py-2.5 border border-slate-300border-slate-600bg-slate-700text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as PartyType })}>
								<option>Buyer</option>
								<option>Supplier</option>
							</select>
						</div>
						<div>
							<label className="text-xs font-medium text-slate-700text-slate-300 mb-1 block">Contact</label>
							<input className="w-full px-3 py-2.5 border border-slate-300border-slate-600bg-slate-700text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
						</div>
					</div>

					{/* Party Items Section */}
					<div className="border-t border-slate-200 pt-4">
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-semibold text-slate-900">Party Items (Optional)</label>
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
										<input
											type="text"
											className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
											value={item.itemName}
											onChange={e => updateItem(item.id, 'itemName', e.target.value)}
											placeholder="Enter item name"
										/>
									</div>

									<div className="flex-1">
										<label className="text-xs font-medium text-slate-600 mb-1 block">
											Item Price (Rs.) {!isAdmin && <span className="text-xs text-slate-500">(Read-only)</span>}
										</label>
										<input
											type="number"
											min="0"
											step="0.01"
											disabled={!isAdmin}
											className={`w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${
												!isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''
											}`}
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
				</div>

				<div className="pt-4 text-right">
					<button className="px-5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" onClick={submit}>{editingId ? 'Save Changes' : 'Add Party'}</button>
				</div>
			</Modal>

			<ConfirmDeleteDialog
				isOpen={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, partyId: '', partyName: '' })}
				onConfirm={handleDelete}
				itemName={deleteDialog.partyName}
				message="Are you sure you want to delete"
			/>
		</div>
	);
}


