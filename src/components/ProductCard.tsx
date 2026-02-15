"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { Check } from "lucide-react";

export default function ProductCard({ product }: { product: any }) {
	const addToCart = useCartStore((state) => state.addToCart);
	const [isAdded, setIsAdded] = useState(false);
	const isOutOfStock = product.quantity <= 0;

	let images: string[] = [];
	try {
		if (Array.isArray(product.images)) {
			images = product.images;
		} else if (
			typeof product.images === "string" &&
			product.images.trim().startsWith("[")
		) {
			images = JSON.parse(product.images);
		} else if (product.images) {
			images = [product.images];
		}
	} catch (error) {
		images = [];
	}

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		addToCart({
			id: product.id,
			name: product.name,
			price: product.price,
			image: images[0],
			quantity: 1,
		});

		// Feedback logic
		setIsAdded(true);
		setTimeout(() => setIsAdded(false), 2000);
	};

	return (
		<div className="group relative flex flex-col">
			<Link href={`/product/${product.id}`} className="cursor-pointer">
				<div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-sm relative">
					<img
						src={images[0]}
						alt={product.name}
						className={`h-full w-full object-cover transition-opacity duration-500 ${
							isOutOfStock
								? "opacity-40"
								: "group-hover:opacity-75"
						}`}
					/>
					{isOutOfStock && (
						<span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 uppercase tracking-widest">
							Out of Stock
						</span>
					)}
				</div>

				<div className="mt-4 flex flex-col items-center">
					<h3 className="text-xs uppercase tracking-tight text-gray-700 text-center px-2">
						{product.name}
					</h3>
					<p className="mt-1 text-sm font-medium text-gray-900">
						₦{product.price?.toLocaleString()}.00
					</p>
				</div>
			</Link>

			<div className="flex justify-center h-8">
				{!isOutOfStock && (
					<button
						onClick={handleAddToCart}
						disabled={isAdded}
						className={`mt-2 text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-1 ${
							isAdded
								? "text-green-600 font-bold"
								: "underline underline-offset-4 hover:text-gray-500"
						}`}>
						{isAdded ? (
							<>
								<Check size={12} /> ADDED TO BAG
							</>
						) : (
							"Add to Cart"
						)}
					</button>
				)}
			</div>
		</div>
	);
}
