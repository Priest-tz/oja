"use client";
import { useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface FilterProps {
	isOpen: boolean;
	onClose: () => void;
	activeCategory: string;
	setCategory: (cat: string) => void;
	totalItems: number;
}

export default function FilterSidebar({
	isOpen,
	onClose,
	activeCategory,
	setCategory,
	totalItems,
}: FilterProps) {
	const categories = [
		"All",
		"Electronics",
		"Protein Snack Bar",
		"Apparel",
		"Home Decor",
	];
	const sortOptions = [
		"Featured",
		"Newest",
		"Price: Low to High",
		"Price: High to Low",
	];

	// Prevent background scrolling when sidebar is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<>
			{/* Background Overlay */}
			<div
				className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
					isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				onClick={onClose}
			/>

			{/* Sidebar Drawer */}
			<aside
				className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 p-8 transform transition-transform duration-500 ease-in-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{ maxHeight: "100dvh" }} 
			>
				{/* Header - Fixed Height */}
				<div className="flex-shrink:0 flex items-center justify-between border-b pb-6 mb-8">
					<span className="text-[12px] uppercase tracking-[0.3em] font-black">
						Filters
					</span>
					<button
						onClick={onClose}
						className="hover:rotate-90 transition-transform p-1">
						<X size={24} />
					</button>
				</div>

				{/* Scrollable Content - Takes up remaining space */}
				<div className="flex-1 overflow-y-auto pr-2 space-y-10 custom-scrollbar overscroll-contain">
					{/* Sort By Section */}
					<div>
						<h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-5 text-gray-400">
							Sort By
						</h3>
						<div className="relative">
							<select className="w-full bg-gray-50 border-none text-[11px] uppercase tracking-wider p-4 appearance-none cursor-pointer focus:ring-1 focus:ring-black">
								{sortOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							<ChevronDown
								size={14}
								className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
							/>
						</div>
					</div>

					{/* Categories Section */}
					<div>
						<h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-5 text-gray-400">
							Product Category
						</h3>
						<ul className="space-y-4">
							{categories.map((cat) => (
								<li key={cat}>
									<button
										onClick={() => setCategory(cat)}
										className={`text-[11px] uppercase tracking-wider block w-full text-left transition-all ${
											activeCategory === cat
												? "text-black font-bold translate-x-2"
												: "text-gray-500 hover:text-black hover:translate-x-1"
										}`}>
										{activeCategory === cat && (
											<span className="mr-2">•</span>
										)}
										{cat}
									</button>
								</li>
							))}
						</ul>
					</div>

					{/* Price Range */}
					<div className="pt-2">
						<div className="flex justify-between items-center mb-5">
							<h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
								Price Range
							</h3>
							<span className="text-[9px] text-gray-300 italic">
								Not available
							</span>
						</div>
						<div className="px-2">
							<div className="h-0.5 bg-gray-100 relative w-full">
								<div className="absolute h-full w-2/3 bg-gray-300 left-4"></div>
								<div className="absolute h-4 w-4 bg-white border border-gray-300 rounded-full -top-2 left-4 shadow-sm"></div>
								<div className="absolute h-4 w-4 bg-white border border-gray-300 rounded-full -top-2 left-[70%] shadow-sm"></div>
							</div>
							<div className="flex justify-between mt-6">
								<div className="border border-gray-100 p-2 px-4 text-[11px] text-gray-400">
									$0
								</div>
								<div className="border border-gray-100 p-2 px-4 text-[11px] text-gray-400">
									$500+
								</div>
							</div>
						</div>
					</div>

					{/* Availability Section */}
					<div className="pb-4">
						<h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-5 text-gray-400">
							Availability
						</h3>
						<div className="space-y-3">
							<label className="flex items-center space-x-3 cursor-pointer group">
								<input
									type="checkbox"
									className="w-4 h-4 border-gray-300 rounded accent-black"
									defaultChecked
								/>
								<span className="text-[11px] uppercase tracking-wider text-gray-600 group-hover:text-black">
									In Stock
								</span>
							</label>
							<label className="flex items-center space-x-3 cursor-pointer group">
								<input
									type="checkbox"
									className="w-4 h-4 border-gray-300 rounded accent-black"
								/>
								<span className="text-[11px] uppercase tracking-wider text-gray-600 group-hover:text-black">
									Pre-Order
								</span>
							</label>
						</div>
					</div>
				</div>

				{/* Footer Action - Fixed Height */}
				<div className="flex-shrink:0 pt-6 mt-4 border-t bg-white">
					<button
						onClick={onClose}
						className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-900 transition-colors shadow-xl">
						Apply & View ({totalItems} Items)
					</button>
					<button
						className="w-full mt-4 text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
						onClick={() => setCategory("All")}>
						Clear All Filters
					</button>
				</div>
			</aside>
		</>
	);
}
