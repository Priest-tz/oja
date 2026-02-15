"use client";

import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
	const router = useRouter();
	const {
		cart,
		updateQuantity,
		removeFromCart,
		getSubtotal,
		getVat,
		getTotal,
	} = useCartStore();

	if (cart.length === 0) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-32 text-center">
				<h1 className="font-serif text-4xl mb-6">Your bag is empty</h1>
				<p className="text-gray-500 uppercase tracking-widest text-[10px] mb-8">
					Items you add to your bag will appear here.
				</p>
				<Link
					href="/"
					className="inline-block bg-black text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
					Continue Shopping
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-6 py-12">
			<h1 className="font-serif text-3xl mb-12">Shopping Bag</h1>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
				{/* Cart Items List */}
				<div className="lg:col-span-8">
					<div className="border-t border-gray-100">
						{cart.map((item) => (
							<div
								key={item.id}
								className="flex py-8 border-b border-gray-100 items-center">
								<div className="h-32 w-24 flex-shrink:0 overflow-hidden bg-gray-50 rounded-sm">
									<img
										src={item.image}
										alt={item.name}
										className="h-full w-full object-cover"
									/>
								</div>

								<div className="ml-6 flex-1 flex flex-col">
									<div className="flex justify-between">
										<div>
											<h3 className="text-xs uppercase tracking-widest font-bold">
												{item.name}
											</h3>
											<p className="mt-1 text-xs text-gray-500 italic font-serif">
												Unit Price: ₦
												{item.price.toLocaleString()}
											</p>
										</div>
										<button
											onClick={() =>
												removeFromCart(item.id)
											}
											className="text-gray-400 hover:text-black transition-colors">
											<Trash2 size={16} />
										</button>
									</div>

									<div className="flex items-center justify-between mt-auto">
										{/* Quantity Selector */}
										<div className="flex items-center border border-gray-200 rounded-sm">
											<button
												onClick={() =>
													updateQuantity(
														item.id,
														item.quantity - 1,
													)
												}
												className="p-2 hover:bg-gray-50">
												<Minus size={12} />
											</button>
											<span className="px-4 text-[12px] font-medium">
												{item.quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(
														item.id,
														item.quantity + 1,
													)
												}
												className="p-2 hover:bg-gray-50">
												<Plus size={12} />
											</button>
										</div>

										<p className="text-sm font-bold">
											₦
											{(
												item.price * item.quantity
											).toLocaleString()}
											.00
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-4">
					<div className="bg-gray-50 p-8 rounded-sm sticky top-24">
						<h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 border-b pb-4">
							Order Summary
						</h2>

						<div className="space-y-4">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal</span>
								<span>
									₦{getSubtotal().toLocaleString()}.00
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									VAT (7.5%)
								</span>
								<span>₦{getVat().toLocaleString()}.00</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Shipping</span>
								<span className="text-[10px] uppercase tracking-widest text-green-600">
									Calculated at checkout
								</span>
							</div>

							<div className="border-t border-gray-200 pt-4 mt-4 flex justify-between">
								<span className="font-serif text-lg italic">
									Total
								</span>
								<span className="font-bold text-lg">
									₦{getTotal().toLocaleString()}.00
								</span>
							</div>
						</div>

						<button
							onClick={() => router.push("/checkout")}
							className="w-full mt-8 bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group">
							Proceed to Checkout
							<ArrowRight size={14} className="..." />
						</button>

						<p className="mt-4 text-[9px] text-gray-400 text-center uppercase tracking-widest">
							Secure payment powered by Paystack
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
