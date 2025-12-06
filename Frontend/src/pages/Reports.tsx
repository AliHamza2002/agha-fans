import { useMemo, useEffect } from 'react';
import { useStore } from '../store/store';

function Bar({ label, value, max, gradient }: { label: string; value: number; max: number; gradient?: string }) {
	const width = max === 0 ? 0 : Math.round((value / max) * 100);
	const gradientClass = gradient || 'from-indigo-500 to-purple-600';
	return (
		<div className="space-y-2">
			<div className="text-sm text-slate-700 font-medium flex justify-between"><span>{label}</span><span className="font-bold text-slate-900">Rs. {value.toLocaleString()}</span></div>
			<div className="h-3 bg-slate-100 rounded-full overflow-hidden">
				<div className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-500 shadow-sm`} style={{ width: `${width}%` }} />
			</div>
		</div>
	);
}

export default function Reports() {
	const { transactions, materials, getTotals, fetchTransactions, fetchMaterials } = useStore();
	const { stockValue } = getTotals();

	// Fetch data on mount
	useEffect(() => {
		fetchTransactions();
		fetchMaterials();
	}, [fetchTransactions, fetchMaterials]);

	const byType = useMemo(() => {
		const purchase = transactions.filter(t => t.type === 'Purchase').reduce((a, t) => a + t.quantity * t.unitPrice, 0);
		const sale = transactions.filter(t => t.type === 'Sale').reduce((a, t) => a + t.quantity * t.unitPrice, 0);
		return { purchase, sale };
	}, [transactions]);

	const stockByCategory = useMemo(() => {
		return ['Raw','Semi-Finished','Final'].map(c => ({
			label: c,
			value: materials.filter(m => m.category === (c as any)).reduce((a, m) => a + m.quantity * (m.unitPrice || 0), 0),
		}));
	}, [materials]);

	const maxStock = Math.max(1, ...stockByCategory.map(s => s.value));

	return (
		<div className="space-y-6">
			<h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reports</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
					<div className="font-bold text-lg text-slate-900 mb-5">Monthly Totals (All-time)</div>
					<div className="space-y-4">
						<Bar label="Purchases" value={byType.purchase} max={Math.max(byType.purchase, byType.sale)} gradient="from-blue-500 to-cyan-600" />
						<Bar label="Sales" value={byType.sale} max={Math.max(byType.purchase, byType.sale)} gradient="from-emerald-500 to-teal-600" />
					</div>
				</div>
				<div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
					<div className="font-bold text-lg text-slate-900 mb-5">Stock Value by Category</div>
					<div className="space-y-4">
						{stockByCategory.map((s, idx) => {
							const gradients = ['from-indigo-500 to-purple-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-rose-600'];
							return <Bar key={s.label} label={s.label} value={s.value} max={maxStock} gradient={gradients[idx] || 'from-indigo-500 to-purple-600'} />;
						})}
					</div>
					<div className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-600">
						Total Stock Value: <span className="font-bold text-lg text-slate-900">Rs. {stockValue.toLocaleString()}</span>
					</div>
				</div>
			</div>
		</div>
	);
}



