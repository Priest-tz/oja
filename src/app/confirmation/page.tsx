"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Package, Home } from "lucide-react";

function ConfirmationContent() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const params = useSearchParams();
	const ref = params.get("ref") ?? "N/A";
	const name = params.get("name") ?? "Customer";
	const email = params.get("email") ?? "";
	const total = params.get("total") ?? "0";

	return (
		<main className="min-h-screen bg-gray-100 py-12 px-4">
			<div className="w-full max-w-lg mx-auto">
				<div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
					{/* Success Banner */}
					<div className="bg-emerald-50 px-8 py-10 text-center border-b border-emerald-100">
						<div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
							<CheckCircle2 size={30} className="text-white" />
						</div>
						<h1 className="text-2xl font-bold text-stone-800">
							Order Confirmed
						</h1>
						<p className="text-stone-500 text-sm mt-1">
							Hi {name}, we've received your order and it's being
							processed.
						</p>
					</div>

					{/* Receipt Details */}
					<div className="p-8 space-y-6">
						<div className="flex justify-between items-start border-b border-stone-100 pb-6">
							<div>
								<p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">
									Date
								</p>
								<p className="text-sm font-medium text-stone-700">
									{/* 2. Only render the date once the client has mounted */}
									{mounted
										? new Date().toLocaleDateString()
										: "---"}
								</p>
							</div>
							<div className="text-right">
								<p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">
									Reference
								</p>
								<p className="text-sm font-mono font-semibold text-stone-800">
									{ref}
								</p>
							</div>
						</div>

						{/* Price Breakdown */}
						<div className="space-y-3">
							<p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
								Payment Summary
							</p>
							<div className="flex justify-between text-sm">
								<span className="text-stone-500">Method</span>
								<span className="text-stone-800 font-medium">
									Paystack (Card/Transfer)
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-stone-500">Shipping</span>
								<span className="text-emerald-600 font-medium">
									Free Delivery
								</span>
							</div>
							<div className="flex justify-between text-lg font-bold text-stone-900 pt-3 border-t border-stone-100">
								<span>Amount Paid</span>
								<span>
									₦{Number(total).toLocaleString()}.00
								</span>
							</div>
						</div>

						{/* Instructions */}
						<div className="bg-amber-50 rounded-2xl p-4 flex gap-3">
							<Package
								size={18}
								className="text-amber-600 flex-shrink:0"
							/>
							<p className="text-xs text-amber-800 leading-relaxed">
								A digital receipt has been sent to{" "}
								<strong>{email}</strong>. Please keep this
								reference number for your records. You will
								receive another update once your package has
								been dispatched.
							</p>
						</div>

						{/* Actions */}
						<div className="grid grid-cols-1 gap-3 pt-4">
							<button
								onClick={() => window.print()}
								className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
								Print Receipt
							</button>
							<Link
								href="/"
								className="w-full flex items-center justify-center gap-2 bg-emerald-400 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm">
								<Home size={15} />
								Return to Shop
							</Link>
						</div>
					</div>
				</div>

				<p className="text-center text-stone-400 text-xs mt-8">
					Need help? Contact support at support@yourstore.com
				</p>
			</div>
		</main>
	);
}

export default function OrderConfirmationPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-[#F5F0EB]" />}>
			<ConfirmationContent />
		</Suspense>
	);
}
