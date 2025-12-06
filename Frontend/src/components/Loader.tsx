// Themed Loader Component
export function Loader({ fullScreen = false, message = 'Loading...' }: { fullScreen?: boolean; message?: string }) {
	if (fullScreen) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
				<div className="text-center">
					<div className="relative w-20 h-20 mx-auto mb-4">
						{/* Outer spinning ring */}
						<div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
						{/* Inner pulsing circle */}
						<div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
					</div>
					<p className="text-slate-600 font-medium">{message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center py-12">
			<div className="text-center">
				<div className="relative w-16 h-16 mx-auto mb-3">
					{/* Outer spinning ring */}
					<div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
					{/* Inner pulsing circle */}
					<div className="absolute inset-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
				</div>
				<p className="text-slate-600 text-sm font-medium">{message}</p>
			</div>
		</div>
	);
}

// Mini loader for buttons and small components
export function MiniLoader({ className = '' }: { className?: string }) {
	return (
		<div className={`inline-block ${className}`}>
			<div className="relative w-5 h-5">
				<div className="absolute inset-0 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
			</div>
		</div>
	);
}

// Empty state component when no data is available
export function EmptyState({ 
	icon: Icon, 
	title, 
	description, 
	action 
}: { 
	icon?: React.ComponentType<{ className?: string }>;
	title: string;
	description?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			{Icon && (
				<div className="w-16 h-16 mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
					<Icon className="w-8 h-8 text-indigo-600" />
				</div>
			)}
			<h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
			{description && (
				<p className="text-slate-600 text-center max-w-md mb-6">{description}</p>
			)}
			{action}
		</div>
	);
}


