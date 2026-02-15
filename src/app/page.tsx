"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import { fetchProducts } from "@/services/api";
import { SlidersHorizontal } from "lucide-react";

function HomePageContent() {
	const searchParams = useSearchParams();
	const searchQuery = searchParams.get("search") || "";

	const [products, setProducts] = useState<any[]>([]);
	const [category, setCategory] = useState("All");
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const loadData = async (isInitial = false) => {
		setLoading(true);
		// If we are starting a new search or category change, clear products immediately
		if (isInitial) setProducts([]);

		try {
			const targetPage = isInitial ? 1 : page;
			const response = await fetchProducts(
				targetPage,
				12,
				category,
				searchQuery,
			);

			setProducts((prev) =>
				isInitial ? response.data : [...prev, ...response.data],
			);
			setHasMore(response.meta.hasNextPage);
			setPage(isInitial ? 2 : targetPage + 1);
		} catch (err) {
			console.error("Fetch error:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData(true);
	}, [category, searchQuery]);

	// UI States for cleaner JSX
	const isInitialLoading = loading && products.length === 0;
	const hasNoResults = !loading && products.length === 0;

	return (
		<div className="max-w-7xl mx-auto px-6 py-10">
			{/* Search Result Header */}
			{searchQuery && (
				<div className="mb-8">
					<p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
						Search Results for:
					</p>
					<h1 className="text-2xl font-serif mt-1 italic">
						"{searchQuery}"
					</h1>
				</div>
			)}

			{/* Filter Bar */}
			<div className="flex justify-between items-center mb-8 border-b pb-4">
				<button
					onClick={() => setIsFilterOpen(true)}
					className="flex items-center gap-2 border border-gray-500 px-3 py-1 rounded-sm transition-colors hover:bg-gray-50">
					<SlidersHorizontal size={18} />
					<span className="text-xs font-bold uppercase tracking-widest">
						Filter
					</span>
				</button>
			</div>

			<FilterSidebar
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				activeCategory={category}
				setCategory={(cat) => {
					setCategory(cat);
					setIsFilterOpen(false);
				}}
				totalItems={products.length}
			/>

			{/* Main Content Area */}
			{isInitialLoading ? (
				/* 1. Show skeletons when searching/loading initial page */
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
					{Array.from({ length: 8 }).map((_, i) => (
						<ProductSkeleton key={i} />
					))}
				</div>
			) : hasNoResults ? (
				/* 2. Show empty state if no matches found */
				<div className="text-center py-32 border border-dashed border-gray-200 rounded-lg">
					<p className="text-gray-400 uppercase tracking-[0.3em] text-[10px] mb-2">
						No items found matching your search
					</p>
					<button
						onClick={() => (window.location.href = "/")}
						className="text-xs underline underline-offset-4 uppercase tracking-widest">
						Clear all filters
					</button>
				</div>
			) : (
				/* 3. Show Product Grid */
				<>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
						{products.map((item) => (
							<ProductCard key={item.id} product={item} />
						))}
						{/* Skeletons for "Load More" pagination only */}
						{loading &&
							Array.from({ length: 4 }).map((_, i) => (
								<ProductSkeleton key={`more-${i}`} />
							))}
					</div>

					{/* Load More Section */}
					<div className="mt-16 flex flex-col items-center justify-center border-t pt-10">
						{hasMore && !loading && (
							<button
								onClick={() => loadData(false)}
								className="text-[12px] uppercase tracking-[0.3em] font-bold border border-gray-500 px-4 py-1 rounded-sm hover:bg-gray-100 transition-all">
								Load More
							</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
export default function HomePage() {
	return (
		<Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
			<HomePageContent />
		</Suspense>
	);
}
