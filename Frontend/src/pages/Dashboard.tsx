import { useStore } from '../store/store';
import { Link } from 'react-router-dom';
import { IndianRupee, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

function StatCard({ title, value, icon, gradient }: { title: string; value: string; icon: ReactNode; gradient?: string }) {
	const gradientClass = gradient || 'from-indigo-500 to-purple-600';
	return (
		<div className="bg-whitebg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-200border-slate-700 hover:shadow-glow transition-all">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-sm text-slate-500text-slate-400 font-medium">{title}</div>
					<div className="mt-2 text-2xl font-bold text-slate-900text-slate-100">{value}</div>
				</div>
				<div className={`bg-gradient-to-br ${gradientClass} p-3 rounded-xl text-white shadow-lg`}>
					{icon}
				</div>
			</div>
		</div>
	);
}

export default function Dashboard() {
	const { getTotals, materials } = useStore();
	const { totalPurchases, totalSales, stockValue, profit } = getTotals();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-900text-slate-100">Dashboard</h1>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				<StatCard title="Total Purchases" value={`Rs. ${totalPurchases.toLocaleString()}`} icon={<IndianRupee className="h-7 w-7" />} gradient="from-blue-500 to-cyan-600" />
				<StatCard title="Total Sales" value={`Rs. ${totalSales.toLocaleString()}`} icon={<TrendingUp className="h-7 w-7" />} gradient="from-emerald-500 to-teal-600" />
				<StatCard title="Current Stock Value" value={`Rs. ${stockValue.toLocaleString()}`} icon={<IndianRupee className="h-7 w-7" />} gradient="from-amber-500 to-orange-600" />
				<StatCard title="Profit / Loss" value={`Rs. ${profit.toLocaleString()}`} icon={<TrendingUp className="h-7 w-7" />} gradient={profit >= 0 ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600"} />
			</div>

			<div className="bg-whitebg-slate-800 rounded-2xl p-6 shadow-soft border border-slate-200border-slate-700">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-bold text-lg text-slate-900text-slate-100">Low Stock Alerts</h2>
					<Link to="/materials" className="text-sm font-medium text-indigo-600text-indigo-400 hover:text-indigo-700hover:text-indigo-300 hover:underline">Manage Materials</Link>
				</div>
				<div className="space-y-2">
					{materials.filter(m => (m.lowStockThreshold ?? 0) > 0 && m.quantity <= (m.lowStockThreshold ?? 0)).length === 0 && (
						<div className="text-sm text-slate-500text-slate-400 p-4 text-center bg-green-50bg-green-900/20 rounded-xl border border-green-200border-green-800">
							✓ All good. No low stock items.
						</div>
					)}
					{materials.filter(m => (m.lowStockThreshold ?? 0) > 0 && m.quantity <= (m.lowStockThreshold ?? 0)).map(m => (
						<div key={m.id} className="flex items-center justify-between p-4 border border-orange-200border-orange-800 rounded-xl bg-orange-50bg-orange-900/20 hover:bg-orange-100hover:bg-orange-900/30 transition">
							<div>
								<div className="font-semibold text-slate-900text-slate-100">{m.name}</div>
								<div className="text-xs text-slate-600text-slate-400 mt-1">{m.category} • {m.quantity} {m.unit} in stock (Threshold: {m.lowStockThreshold} {m.unit})</div>
							</div>
							<Link to={`/materials`} className="text-sm font-medium text-indigo-600text-indigo-400 hover:text-indigo-700hover:text-indigo-300 hover:underline">Replenish</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}


