import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { useLocalBuyer } from '../contexts/LocalBuyerContext';
import { toast } from '../components/Toast';
import { useRef, useEffect } from 'react';

export default function Receipt() {
	const navigate = useNavigate();
	const receiptRef = useRef<HTMLDivElement>(null);
	const { pendingBuyer, addBuyer, setPendingBuyer } = useLocalBuyer();

	// Redirect if no pending buyer
	useEffect(() => {
		if (!pendingBuyer) {
			navigate('/local-buyer');
		}
	}, [pendingBuyer, navigate]);

	if (!pendingBuyer) {
		return null;
	}

	const handlePrint = async () => {
		try {
			// Use browser's print functionality
			window.print();
			toast.success('Print dialog opened');
		} catch (error) {
			toast.error('Failed to open print dialog');
		}
	};

	const handlePost = () => {
		// Add the buyer to the posted list
		addBuyer(pendingBuyer);
		// Clear pending buyer
		setPendingBuyer(null);
		// Show success message
		toast.success('Receipt posted successfully!');
		// Navigate back to local buyer page
		setTimeout(() => {
			navigate('/local-buyer');
		}, 1000);
	};

	const receiptDate = new Date(pendingBuyer.date);

	return (
		<div className="space-y-6">
			{/* Action Buttons */}
			<div className="flex items-center justify-between">
				<button
					onClick={() => navigate('/local-buyer')}
					className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
				>
					<ArrowLeft className="h-4 w-4" /> Back
				</button>
				<div className="flex gap-3">
					<button
						onClick={handlePrint}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm font-medium"
					>
						<Printer className="h-4 w-4" /> Print Receipt
					</button>
					<button
						onClick={handlePost}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md font-medium"
					>
						<CheckCircle className="h-4 w-4" /> Post
					</button>
				</div>
			</div>

			{/* Receipt */}
			<div ref={receiptRef} className="bg-white rounded-2xl shadow-soft border border-slate-200 print:shadow-none print:border-0">
				<div className="p-8 space-y-6">
					{/* Header */}
					<div className="text-center border-b border-slate-200 pb-6">
						<h1 className="text-3xl font-bold text-slate-900 mb-2">AGHA FANS</h1>
						<p className="text-slate-600">Sales Receipt</p>
						<p className="text-sm text-slate-500 mt-2">
							Receipt Date: {receiptDate.toLocaleDateString('en-US', { 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}
						</p>
					</div>

					{/* Buyer Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
								Buyer Information
							</h2>
							<div>
								<p className="text-xs font-medium text-slate-600">Name</p>
								<p className="text-base font-semibold text-slate-900">{pendingBuyer.buyerName}</p>
							</div>
							{pendingBuyer.contact && (
								<div>
									<p className="text-xs font-medium text-slate-600">Contact</p>
									<p className="text-base text-slate-900">{pendingBuyer.contact}</p>
								</div>
							)}
							{pendingBuyer.address && (
								<div>
									<p className="text-xs font-medium text-slate-600">Address</p>
									<p className="text-base text-slate-900">{pendingBuyer.address}</p>
								</div>
							)}
						</div>

						<div className="space-y-3">
							<h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
								Receipt Details
							</h2>
							<div>
								<p className="text-xs font-medium text-slate-600">Receipt Number</p>
								<p className="text-base font-mono font-semibold text-slate-900">
									#{receiptDate.getTime().toString().slice(-8)}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium text-slate-600">Time</p>
								<p className="text-base text-slate-900">
									{receiptDate.toLocaleTimeString('en-US', { 
										hour: '2-digit', 
										minute: '2-digit' 
									})}
								</p>
							</div>
						</div>
					</div>

					{/* Items Table */}
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
							Items
						</h2>
						<div className="overflow-auto">
							<table className="min-w-full">
								<thead>
									<tr className="bg-slate-50 border-b border-slate-200">
										<th className="p-3 text-left text-xs font-semibold text-slate-700">Item Name</th>
										<th className="p-3 text-center text-xs font-semibold text-slate-700">Quantity</th>
										<th className="p-3 text-right text-xs font-semibold text-slate-700">Price</th>
										<th className="p-3 text-right text-xs font-semibold text-slate-700">Total</th>
									</tr>
								</thead>
								<tbody>
									{pendingBuyer.items.map((item, index) => (
										<tr key={index} className="border-b border-slate-100">
											<td className="p-3 text-slate-900 font-medium">{item.itemName}</td>
											<td className="p-3 text-center text-slate-900">1</td>
											<td className="p-3 text-right text-slate-900">
												Rs. {item.itemPrice.toLocaleString()}
											</td>
											<td className="p-3 text-right font-semibold text-slate-900">
												Rs. {item.itemPrice.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Total */}
					<div className="border-t-2 border-slate-300 pt-4">
						<div className="flex justify-between items-center">
							<span className="text-xl font-semibold text-slate-900">Total Amount:</span>
							<span className="text-3xl font-bold text-indigo-600">
								Rs. {pendingBuyer.totalAmount.toLocaleString()}
							</span>
						</div>
					</div>

					{/* Footer */}
					<div className="border-t border-slate-200 pt-6 mt-8 text-center">
						<p className="text-sm text-slate-600">Thank you for your business!</p>
						<p className="text-xs text-slate-500 mt-2">
							This is a computer-generated receipt and does not require a signature.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}


