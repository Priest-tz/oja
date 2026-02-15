"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingBag, X, User, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [query, setQuery] = useState(searchParams.get("search") || "");

	// Hydration Fix State
	const [mounted, setMounted] = useState(false);

	const cart = useCartStore((state) => state.cart);
	const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

	// Run only on mount to ensure we are on the client
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (query === (searchParams.get("search") || "")) return;
		const timeoutId = setTimeout(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (query.trim()) params.set("search", query);
			else params.delete("search");
			router.push(`/?${params.toString()}`);
		}, 500);
		return () => clearTimeout(timeoutId);
	}, [query, router, searchParams]);

	const navItems = ["WOMEN", "MEN", "SHOES", "ACCESSORIES", "LAST CHANCE"];

	return (
		<nav className="border-b border-gray-100 bg-white sticky top-0 z-50 w-full">
			<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
				{/* LEFT: Logo */}
				<Link
					href="/"
					className="text-3xl md:text-4xl font-serif tracking-tighter shrink-0">
					ỌJÀ
				</Link>

				{/* CENTER: Navigation (Desktop Only) */}
				<div className="hidden md:flex items-center space-x-8">
					{navItems.map((item) => (
						<Link
							key={item}
							href={`/category/${item.toLowerCase().replace(" ", "-")}`}
							className="text-[11px] font-medium tracking-[0.2em] hover:text-gray-500 transition-colors whitespace-nowrap">
							{item}
						</Link>
					))}
				</div>

				{/* RIGHT: Search and Icons */}
				<div className="flex items-center space-x-4 md:space-x-5">
					{isSearchOpen ? (
						<div className="flex items-center border-b border-black">
							<input
								autoFocus
								type="text"
								placeholder="SEARCH..."
								className="text-[10px] uppercase tracking-widest outline-none pb-1 w-28 md:w-32"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							<X
								size={18}
								className="mb-1 ml-2 cursor-pointer"
								onClick={() => {
									setIsSearchOpen(false);
									setQuery("");
								}}
							/>
						</div>
					) : (
						<Search
							size={20}
							className="text-gray-700 cursor-pointer"
							onClick={() => setIsSearchOpen(true)}
						/>
					)}

					<Link href="/account" className="hidden md:block">
						<User size={20} className="text-gray-700" />
					</Link>
					<Link href="/wishlist" className="hidden md:block">
						<Heart size={20} className="text-gray-700" />
					</Link>

					{/* Cart Icon - Now Hydration Safe */}
					<Link href="/cart" className="relative">
						<ShoppingBag size={20} className="text-gray-700" />
						{mounted && cartCount > 0 && (
							<span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in fade-in zoom-in duration-300">
								{cartCount}
							</span>
						)}
					</Link>
				</div>
			</div>
		</nav>
	);
}
