import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [role, setRole] = useState<UserRole>('StoreBoy');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { signup } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		setLoading(true);
		try {
			const user = await signup(username, email, password, role);
			if (user) {
				// Redirect based on role
				if (user.role === 'FinalBoy') {
					navigate('/finished');
				} else if (user.role === 'StoreBoy') {
					navigate('/materials');
				} else {
					navigate('/');
				}
			} else {
				setError('Registration failed. Please try again.');
			}
		} catch (err: any) {
			setError(err.message || 'Registration failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* Left Side - Form */}
			<div className="w-full lg:w-2/5 flex items-center justify-center bg-white p-8">
				<div className="w-full max-w-md">
					<div className="mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-full mb-4">
							<UserPlus className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
						<p className="text-slate-600">Sign up to get started</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
								{error}
							</div>
						)}

						<div>
							<label className="text-sm font-medium text-slate-700 mb-1 block">Username</label>
							<input
								type="text"
								className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>

						<div>
							<label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
							<input
								type="email"
								className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div>
							<label className="text-sm font-medium text-slate-700 mb-1 block">Role</label>
							<select
								className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
								value={role}
								onChange={(e) => setRole(e.target.value as UserRole)}
								required
							>
								<option value="Admin">Admin</option>
								<option value="StoreBoy">StoreBoy</option>
								<option value="FinalBoy">FinalBoy</option>
							</select>
						</div>

						<div>
							<label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
								>
									{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
						</div>

						<div>
							<label className="text-sm font-medium text-slate-700 mb-1 block">Confirm Password</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={6}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
								>
									{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium disabled:opacity-50"
						>
							{loading ? 'Creating account...' : 'Sign Up'}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-slate-600">
							Already have an account?{' '}
							<Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>

			{/* Right Side - Visual */}
			<div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNC0xLjc5MSA0LTQgNC00LTEuNzkxLTQtNHptMC0zMGMwLTIuMjA5IDEuNzkxLTQgNC00czQgMS43OTEgNCA0LTEuNzkxIDQtNCA0LTQtMS43OTEtNC00ek02IDM0YzAtMi4yMDkgMS43OTEtNCA0LTRzNCAxLjc5MSA0IDQtMS43OTEgNC00IDQtNC0xLjc5MS00LTR6bTAtMzBjMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNC0xLjc5MSA0LTQgNC00LTEuNzkxLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
				
				<div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
					<div className="max-w-xl text-center mb-12">
						<h2 className="text-5xl font-bold mb-6 drop-shadow-lg">AGHA FANS</h2>
						<p className="text-2xl font-semibold mb-4 text-indigo-100">Business Management System</p>
						<p className="text-lg text-indigo-50 leading-relaxed">
							Join our platform to efficiently manage your inventory, sales, purchases, and business operations all in one place.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-6 w-full max-w-lg">
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
							<div className="text-3xl mb-2">📦</div>
							<h3 className="font-semibold text-lg mb-2">Inventory</h3>
							<p className="text-sm text-indigo-100">Track materials & stock</p>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
							<div className="text-3xl mb-2">💰</div>
							<h3 className="font-semibold text-lg mb-2">Sales</h3>
							<p className="text-sm text-indigo-100">Manage transactions</p>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
							<div className="text-3xl mb-2">📊</div>
							<h3 className="font-semibold text-lg mb-2">Reports</h3>
							<p className="text-sm text-indigo-100">Analyze performance</p>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
							<div className="text-3xl mb-2">🤝</div>
							<h3 className="font-semibold text-lg mb-2">Parties</h3>
							<p className="text-sm text-indigo-100">Manage relationships</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

