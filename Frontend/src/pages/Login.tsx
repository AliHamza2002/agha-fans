import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		const user = await login(username, password);
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
			setError('Invalid username or password');
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
			<div className="bg-white rounded-2xl shadow-soft border border-slate-200 w-full max-w-md p-8">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-full mb-4">
						<LogIn className="h-8 w-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
					<p className="text-slate-600">Sign in to your account</p>
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
						<label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
						<input
							type="password"
							className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition shadow-md font-medium disabled:opacity-50"
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-slate-600">
						Don't have an account?{' '}
						<Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

