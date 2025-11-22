import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RoleBasedRedirect() {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// Redirect based on role
	if (user.role === 'FinalBoy') {
		return <Navigate to="/finished" replace />;
	}

	if (user.role === 'StoreBoy') {
		return <Navigate to="/materials" replace />;
	}

	// Admin goes to dashboard
	return <Navigate to="/" replace />;
}

