import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Home, Layers3, Menu, Users, LogOut, CheckSquare, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmLogoutDialog } from './ConfirmLogoutDialog';

function cx(...classes: (string | false | undefined)[]) {
	return classes.filter(Boolean).join(' ');
}

export function Layout({ children }: PropsWithChildren) {
	const [open, setOpen] = useState(true);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	// *** LOGOUT: Show custom confirmation dialog ***
	const handleLogout = () => {
		setShowLogoutDialog(true);
	};

	// *** LOGOUT: Confirm action ***
	const confirmLogout = () => {
		setShowLogoutDialog(false);
		logout();
		navigate('/login');
	};

	// *** LOGOUT: Cancel action ***
	const cancelLogout = () => {
		setShowLogoutDialog(false);
	};

	const canAccess = (roles: string[]) => {
		return user && roles.includes(user.role);
	};

	return (
		<div className="min-h-full">
			{/* Top Navbar */}
			<header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-soft border-b border-slate-200">
				<div className="flex items-center gap-3 px-4 py-3">
					<button aria-label="Toggle sidebar" className="p-2 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-600" onClick={() => setOpen(v => !v)}>
						<Menu className="h-5 w-5" />
					</button>
					<Link to="/" className="font-bold text-lg tracking-tight bg-brand rounded-full px-4 py-2 bg-clip-text text-white">Fence Factory Ledger</Link>
					<div className="ml-auto flex items-center gap-3">
						{user && (
							<div className="flex items-center gap-2">
								<span className="text-sm text-slate-600 font-medium">{user.username}</span>
								<span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">{user.role}</span>
							</div>
						)}
						{/* *** LOGOUT BUTTON: With tooltip *** */}
						<button
							onClick={handleLogout}
							className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors border border-transparent hover:border-red-200"
							title="Logout from system"
						>
							<LogOut className="h-5 w-5" />
							<span className="text-sm font-medium">Logout</span>
						</button>
					</div>
				</div>
			</header>

			{/* Shell */}
			<div className="flex">
				<aside className={cx('bg-white/90 backdrop-blur-sm border-r border-slate-200 transition-all duration-300 shadow-soft', open ? 'w-64' : 'w-16')}>
					<nav className="px-2 py-4 space-y-1">
						{canAccess(['Admin']) && (
							<NavLink to="/" end className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<Home className="h-5 w-5" />
								{open && <span>Dashboard</span>}
							</NavLink>
						)}
						{canAccess(['Admin', 'StoreBoy']) && (
							<NavLink to="/materials" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<Layers3 className="h-5 w-5" />
								{open && <span>Materials</span>}
							</NavLink>
						)}
						{canAccess(['Admin', 'StoreBoy']) && (
							<NavLink to="/parties" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<Users className="h-5 w-5" />
								{open && <span>Parties</span>}
							</NavLink>
						)}
						{canAccess(['Admin']) && (
							<NavLink to="/reports" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<BarChart3 className="h-5 w-5" />
								{open && <span>Reports</span>}
							</NavLink>
						)}
						{canAccess(['Admin', 'FinalBoy']) && (
							<NavLink to="/finished" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<CheckSquare className="h-5 w-5" />
								{open && <span>Finished</span>}
							</NavLink>
						)}
						{canAccess(['Admin']) && (
							<NavLink to="/sales" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<ShoppingBag className="h-5 w-5" />
								{open && <span>Sales</span>}
							</NavLink>
						)}
						{canAccess(['Admin']) && (
							<NavLink to="/purchase" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<ShoppingCart className="h-5 w-5" />
								{open && <span>Purchase</span>}
							</NavLink>
						)}
						{canAccess(['Admin']) && (
							<NavLink to="/local-buyer" className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all', isActive ? 'bg-brand text-white shadow-glow font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600')}>
								<ShoppingCart className="h-5 w-5" />
								{open && <span>Local Buyer</span>}
							</NavLink>
						)}
						
						{/* *** LOGOUT: Sidebar logout button *** */}
						<div className="pt-4 mt-4 border-t border-slate-200">
							<button 
								onClick={handleLogout}
								className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
								title="Logout from system"
							>
								<LogOut className="h-5 w-5" />
								{open && <span>Logout</span>}
							</button>
						</div>
					</nav>
				</aside>
				<main className="flex-1 p-4 md:p-6 lg:p-8 bg-white">
					{children}
				</main>
			</div>

			{/* *** LOGOUT: Custom confirmation dialog *** */}
			<ConfirmLogoutDialog
				isOpen={showLogoutDialog}
				onConfirm={confirmLogout}
				onCancel={cancelLogout}
			/>
		</div>
	);
}


