import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
	children: ReactNode;
	allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
	const { isAuthenticated, user } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles && user && !allowedRoles.includes(user.role)) {
		// Redirect based on user role
		if (user.role === 'FinalBoy') {
			return <Navigate to="/finished" replace />;
		} else if (user.role === 'StoreBoy') {
			return <Navigate to="/materials" replace />;
		} else {
			return <Navigate to="/" replace />;
		}
	}

	return <>{children}</>;
}

