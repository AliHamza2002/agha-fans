import { X, LogOut, AlertCircle } from 'lucide-react';

interface ConfirmLogoutDialogProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmLogoutDialog({ isOpen, onConfirm, onCancel }: ConfirmLogoutDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			{/* Dialog */}
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-slate-200">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
							<LogOut className="w-6 h-6 text-red-600" />
						</div>
						<h3 className="text-xl font-bold text-slate-900">Confirm Logout</h3>
					</div>
					<button
						onClick={onCancel}
						className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="flex items-start gap-3 mb-4">
						<AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
						<div className="space-y-2">
							<p className="text-slate-700 leading-relaxed">
								Are you sure you want to logout from the system?
							</p>
							<p className="text-sm text-slate-500">
								You will need to login again to access your account and data.
							</p>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
					<button
						onClick={onCancel}
						className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-md"
					>
						Yes, Logout
					</button>
				</div>
			</div>
		</div>
	);
}

