import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import type { Material } from '../store/store';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/Toast';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';

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

export default function Finished() {
	const { materials, addMaterial, updateMaterial, removeMaterial } = useStore();
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<Omit<Material, 'id'>>({
		name: '',
		category: 'Final',
		unit: 'pcs',
		quantity: 0,
		unitPrice: user?.role === 'Admin' ? 0 : undefined,
		description: '',
		lowStockThreshold: 0,
	});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string; productName: string }>({ open: false, productId: '', productName: '' });

	const isAdmin = user?.role === 'Admin';
	const finishedMaterials = useMemo(() => materials.filter(m => m.category === 'Final'), [materials]);

	function submit() {
		if (!form.name.trim()) {
			toast.error('Product name is required');
			return;
		}
		try {
			if (editingId) {
				updateMaterial(editingId, form);
				toast.success('Product updated successfully');
			} else {
				addMaterial(form);
				toast.success('Product added successfully');
			}
			setOpen(false);
			setEditingId(null);
			setForm({
				name: '',
				category: 'Final',
				unit: 'pcs',
				quantity: 0,
				unitPrice: isAdmin ? 0 : undefined,
				description: '',
				lowStockThreshold: 0,
			});
		} catch (error) {
			toast.error('Failed to save product');
		}
	}

	function handleDelete() {
		try {
			removeMaterial(deleteDialog.productId);
			toast.success('Product deleted successfully');
		} catch (error) {
			toast.error('Failed to delete product');
		}
	}

	function openEdit(m: Material) {
		setEditingId(m.id);
		setForm({
			name: m.name,
			category: m.category,
			unit: m.unit,
			quantity: m.quantity,
			unitPrice: m.unitPrice,
			description: m.description || '',
			lowStockThreshold: m.lowStockThreshold || 0,
		});
		setOpen(true);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900">Finished Products</h1>
				<button className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" onClick={() => { setEditingId(null); setForm({ name: '', category: 'Final', unit: 'pcs', quantity: 0, unitPrice: isAdmin ? 0 : undefined, description: '', lowStockThreshold: 0 }); setOpen(true); }}>
					<Plus className="h-4 w-4" /> Add Product
				</button>
			</div>

			<div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-200 overflow-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-center text-slate-600 border-b border-slate-200">
							<th className="p-3 font-semibold">Name</th>
							<th className="p-3 font-semibold">Unit</th>
							<th className="p-3 font-semibold">Quantity</th>
							{isAdmin && <th className="p-3 font-semibold">Unit Price</th>}
							{isAdmin && <th className="p-3 font-semibold">Total Value</th>}
							<th className="p-3 font-semibold">Description</th>
							<th className="p-3 font-semibold">Actions</th>
						</tr>
					</thead>
					<tbody>
						{finishedMaterials.map(m => (
							<tr key={m.id} className="border-b border-slate-100 hover:bg-indigo-50/50 transition">
								<td className="p-3 font-semibold text-slate-900 text-center">{m.name}</td>
								<td className="p-3 text-slate-600 text-center">{m.unit}</td>
								<td className="p-3 font-medium text-slate-900 text-center">{m.quantity.toLocaleString()}</td>
								{isAdmin && <td className="p-3 text-slate-600 text-center">Rs. {(m.unitPrice || 0).toLocaleString()}</td>}
								{isAdmin && <td className="p-3 font-semibold text-slate-900 text-center">Rs. {((m.unitPrice || 0) * m.quantity).toLocaleString()}</td>}
								<td className="p-3 text-slate-600 text-xs text-center">{m.description || '-'}</td>
								<td className="p-3 text-center">
									<div className="flex gap-2 justify-center">
										<button className="px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 transition" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></button>
										{isAdmin && (
											<button className="px-2 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition" onClick={() => setDeleteDialog({ open: true, productId: m.id, productName: m.name })}><Trash2 className="h-4 w-4" /></button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="md:col-span-2">
						<label className="text-xs font-medium text-slate-700 mb-1 block">Product Name</label>
						<input className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
					</div>
					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">Unit</label>
						<select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as 'kg' | 'pcs' })}>
							<option>pcs</option>
							<option>kg</option>
						</select>
					</div>
					<div>
						<label className="text-xs font-medium text-slate-700 mb-1 block">Quantity</label>
						<input type="number" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
					</div>
					{isAdmin && (
						<div>
							<label className="text-xs font-medium text-slate-700 mb-1 block">Unit Price (Rs.)</label>
							<input type="number" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" value={form.unitPrice || 0} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })} />
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
				<div className="pt-4 text-right">
					<button className="px-5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium" onClick={submit}>{editingId ? 'Save Changes' : 'Add Product'}</button>
				</div>
			</Modal>

			<ConfirmDeleteDialog
				isOpen={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, productId: '', productName: '' })}
				onConfirm={handleDelete}
				itemName={deleteDialog.productName}
				message="Are you sure you want to delete"
			/>
		</div>
	);
}

