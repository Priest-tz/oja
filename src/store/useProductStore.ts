import { create } from "zustand";

interface ProductState {
	// Cache format: { "searchQuery-category": { products: [], hasMore: true } }
	cache: Record<string, { data: any[]; hasNextPage: boolean }>;
	setCache: (key: string, data: any[], hasNextPage: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
	cache: {},
	setCache: (key, data, hasNextPage) =>
		set((state) => ({
			cache: { ...state.cache, [key]: { data, hasNextPage } },
		})),
}));
