"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { z } from "zod";
import { ShoppingBag, Lock, ChevronRight, AlertCircle, X } from "lucide-react";

declare global {
	interface Window {
		PaystackPop: new () => {
			resumeTransaction: (
				accessCode: string,
				callbacks?: {
					onSuccess?: (transaction: { reference: string }) => void;
					onCancel?: () => void;
				},
			) => void;
		};
	}
}

const checkoutSchema = z.object({
	firstName: z
		.string()
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name too long"),
	lastName: z
		.string()
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name too long"),
	email: z.string().email("Please enter a valid email address"),
	phone: z
		.string()
		.regex(/^(\+?234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number")
		.or(z.string().min(10, "Phone number too short")),
	address: z.string().min(5, "Please enter your delivery address"),
	city: z.string().min(2, "City is required"),
	state: z.string().min(2, "State is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;
type FormErrors = Partial<Record<keyof CheckoutFormData, string>>;

function generateReference(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `QS-${timestamp}-${random}`;
}

const NIGERIAN_STATES = [
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"FCT - Abuja",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
];

export default function CheckoutPage() {
	const router = useRouter();
	const { cart, getSubtotal, getVat, getTotal, clearCart } = useCartStore();

	const paymentSuccessRef = useRef(false);

	const [formData, setFormData] = useState<CheckoutFormData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [paystackReady, setPaystackReady] = useState(false);
	const [scriptError, setScriptError] = useState(false);

	// Load Paystack V2 inline.js
	useEffect(() => {
		if (document.querySelector('script[src*="paystack"]')) {
			if (typeof window.PaystackPop === "function")
				setPaystackReady(true);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://js.paystack.co/v2/inline.js";
		script.async = true;
		script.onload = () => setPaystackReady(true);
		script.onerror = () => setScriptError(true);
		document.body.appendChild(script);
	}, []);

	useEffect(() => {
		if (cart.length === 0 && !paymentSuccessRef.current) {
			router.replace("/cart");
		}
	}, [cart, router]);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name as keyof CheckoutFormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const validate = (): boolean => {
		const result = checkoutSchema.safeParse(formData);
		if (result.success) {
			setErrors({});
			return true;
		}
		const fieldErrors: FormErrors = {};
		result.error.issues.forEach((issue) => {
			const field = issue.path[0] as keyof CheckoutFormData;
			if (!fieldErrors[field]) fieldErrors[field] = issue.message;
		});
		setErrors(fieldErrors);
		return false;
	};

	const handlePayment = async () => {
		if (!validate()) return;

		if (!paystackReady || typeof window.PaystackPop !== "function") {
			alert("Payment gateway not ready. Please refresh the page.");
			return;
		}

		setIsLoading(true);

		const ref = generateReference();
		const amountInKobo = Math.round(getTotal() * 100);

		const orderTotal = getTotal();

		try {
			const initRes = await fetch("/api/paystack", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: formData.email,
					amount: amountInKobo,
					ref,
					firstname: formData.firstName,
					lastname: formData.lastName,
					phone: formData.phone,
					metadata: {
						custom_fields: [
							{
								display_name: "Customer Name",
								variable_name: "customer_name",
								value: `${formData.firstName} ${formData.lastName}`,
							},
							{
								display_name: "Delivery Address",
								variable_name: "delivery_address",
								value: `${formData.address}, ${formData.city}, ${formData.state}`,
							},
							{
								display_name: "Phone Number",
								variable_name: "phone_number",
								value: formData.phone,
							},
							{
								display_name: "Items Count",
								variable_name: "items_count",
								value: String(
									cart.reduce(
										(acc, item) => acc + item.quantity,
										0,
									),
								),
							},
						],
					},
				}),
			});

			const { access_code, error: initError } = await initRes.json();

			if (!access_code) {
				alert(
					initError ??
						"Could not initialize payment. Please try again.",
				);
				setIsLoading(false);
				return;
			}

			const popup = new window.PaystackPop();
			popup.resumeTransaction(access_code, {
				onSuccess: (transaction) => {
					setIsLoading(false);

					const params = new URLSearchParams({
						ref: transaction.reference,
						name: formData.firstName,
						email: formData.email,
						total: orderTotal.toString(),
					});

					paymentSuccessRef.current = true;
					clearCart();
					router.push(`/confirmation?${params.toString()}`);
				},
				onCancel: () => {
					setIsLoading(false);
				},
			});
		} catch (err) {
			console.error("Payment error:", err);
			alert("Something went wrong. Please try again.");
			setIsLoading(false);
		}
	};

	if (cart.length === 0) return null;

	const subtotal = getSubtotal();
	const vat = getVat();
	const total = getTotal();

	return (
		<main className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b border-stone-200 sticky top-0 z-30">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
					<span className="font-semibold text-stone-800 tracking-tight text-xl">
						Checkout
					</span>
					<div className="flex items-center gap-1.5 text-xs text-stone-400">
						<Lock size={10} />
						<span>Secured by Paystack</span>
					</div>
				</div>
			</header>

			{scriptError && (
				<div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2 text-red-700 text-sm">
					<AlertCircle size={15} />
					Could not load payment gateway. Check your connection and
					refresh.
				</div>
			)}

			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
					{/* LEFT — Customer Info */}
					<section className="space-y-6">
						<div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200">
							<h2 className="text-base font-semibold text-stone-800 mb-5">
								Contact information
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Field
									label="First name"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									error={errors.firstName}
									placeholder="Amara"
									autoComplete="given-name"
								/>
								<Field
									label="Last name"
									name="lastName"
									value={formData.lastName}
									onChange={handleChange}
									error={errors.lastName}
									placeholder="Okafor"
									autoComplete="family-name"
								/>
								<div className="sm:col-span-2">
									<Field
										label="Email address"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleChange}
										error={errors.email}
										placeholder="amara@example.com"
										autoComplete="email"
									/>
								</div>
								<div className="sm:col-span-2">
									<Field
										label="Phone number"
										name="phone"
										type="tel"
										value={formData.phone}
										onChange={handleChange}
										error={errors.phone}
										placeholder="08012345678"
										autoComplete="tel"
									/>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100">
							<h2 className="text-base font-semibold text-stone-800 mb-5">
								Delivery address
							</h2>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-stone-700 mb-1.5">
										Street address
									</label>
									<textarea
										name="address"
										value={formData.address}
										onChange={handleChange}
										rows={2}
										placeholder="14B Adesola Street, Lekki Phase 1"
										autoComplete="street-address"
										className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-800
                      placeholder:text-stone-300 resize-none focus:outline-none focus:ring-2
                      transition-all ${
							errors.address
								? "border-red-400 focus:ring-red-200 bg-red-50"
								: "border-stone-200 focus:ring-amber-200 focus:border-amber-400 bg-stone-50"
						}`}
									/>
									{errors.address && (
										<p className="mt-1 text-xs text-red-500 flex items-center gap-1">
											<AlertCircle size={11} />
											{errors.address}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Field
										label="City"
										name="city"
										value={formData.city}
										onChange={handleChange}
										error={errors.city}
										placeholder="Lagos"
										autoComplete="address-level2"
									/>

									<div>
										<label className="block text-sm font-medium text-stone-700 mb-1.5">
											State
										</label>
										<select
											name="state"
											value={formData.state}
											onChange={handleChange}
											className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-800
                        focus:outline-none focus:ring-2 transition-all appearance-none
                        bg-no-repeat bg-position-[right_1rem_center] ${
							errors.state
								? "border-red-400 focus:ring-red-200 bg-red-50"
								: "border-stone-200 focus:ring-amber-200 focus:border-amber-400 bg-stone-50"
						}`}
											style={{
												backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
											}}>
											<option value="">
												Select state
											</option>
											{NIGERIAN_STATES.map((s) => (
												<option key={s} value={s}>
													{s}
												</option>
											))}
										</select>
										{errors.state && (
											<p className="mt-1 text-xs text-red-500 flex items-center gap-1">
												<AlertCircle size={11} />
												{errors.state}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* RIGHT — Order Summary + Pay */}
					<aside className="space-y-5">
						<div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-base font-semibold text-stone-800">
									Order summary
								</h2>
								<div className="flex items-center gap-1.5 text-xs text-stone-400">
									<ShoppingBag size={13} />
									{cart.reduce(
										(a, i) => a + i.quantity,
										0,
									)}{" "}
									items
								</div>
							</div>

							<ul className="space-y-3 mb-5">
								{cart.map((item) => (
									<li
										key={item.id}
										className="flex items-center gap-3 text-sm">
										<div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink:0">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={item.image}
												alt={item.name}
												className="w-full h-full object-cover"
											/>
											<span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
												{item.quantity}
											</span>
										</div>
										<span className="flex-1 text-stone-600 line-clamp-1">
											{item.name}
										</span>
										<span className="font-medium text-stone-800 whitespace-nowrap">
											₦
											{(
												item.price * item.quantity
											).toLocaleString()}
										</span>
									</li>
								))}
							</ul>

							<div className="space-y-2 border-t border-stone-100 pt-4 text-sm">
								<div className="flex justify-between text-stone-500">
									<span>Subtotal</span>
									<span>₦{subtotal.toLocaleString()}.00</span>
								</div>
								<div className="flex justify-between text-stone-500">
									<span>VAT (7.5%)</span>
									<span>
										₦{Math.round(vat).toLocaleString()}.00
									</span>
								</div>
								<div className="flex justify-between text-stone-500">
									<span>Shipping</span>
									<span className="text-green-600 font-medium">
										Free
									</span>
								</div>
								<div className="flex justify-between font-semibold text-stone-900 text-base pt-2 border-t border-stone-100">
									<span>Total</span>
									<span>
										₦{Math.round(total).toLocaleString()}.00
									</span>
								</div>
							</div>
						</div>
						<button
							onClick={handlePayment}
							disabled={
								isLoading || !paystackReady || scriptError
							}
							className="w-full flex items-center justify-center gap-2 bg-emerald-600 
    hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed 
    text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 
    active:scale-[0.98] text-sm">
							{isLoading ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Processing…
								</>
							) : !paystackReady ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Loading payment…
								</>
							) : (
								<>
									Pay ₦{Math.round(total).toLocaleString()}.00
									<ChevronRight size={16} />
								</>
							)}
						</button>
						<p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1">
							<Lock size={11} />
							Your payment is 100% secure via Paystack
						</p>
					</aside>
				</div>
			</div>
		</main>
	);
}

interface FieldProps {
	label: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
	type?: string;
	placeholder?: string;
	autoComplete?: string;
}

function Field({
	label,
	name,
	value,
	onChange,
	error,
	type = "text",
	placeholder,
	autoComplete,
}: FieldProps) {
	return (
		<div>
			<label className="block text-sm font-medium text-stone-700 mb-1.5">
				{label}
			</label>
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-800
          placeholder:text-stone-300 focus:outline-none focus:ring-2 transition-all ${
				error
					? "border-red-400 focus:ring-red-200 bg-red-50"
					: "border-stone-200 focus:ring-amber-200 focus:border-amber-400 bg-stone-50"
			}`}
			/>
			{error && (
				<p className="mt-1 text-xs text-red-500 flex items-center gap-1">
					<AlertCircle size={11} />
					{error}
				</p>
			)}
		</div>
	);
}
