import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image: string;
}

interface CartStore {
	cart: CartItem[];
	addToCart: (product: CartItem) => void;
	removeFromCart: (id: string) => void;
	updateQuantity: (id: string, qty: number) => void;
	clearCart: () => void;
	getSubtotal: () => number;
	getVat: () => number;
	getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			cart: [],

			addToCart: (product: CartItem) => {
				const currentCart = get().cart;
				const existing = currentCart.find(
					(item) => item.id === product.id,
				);

				if (existing) {
					set({
						cart: currentCart.map((item) =>
							item.id === product.id
								? { ...item, quantity: item.quantity + 1 }
								: item,
						),
					});
				} else {
					set({
						cart: [...currentCart, { ...product, quantity: 1 }],
					});
				}
			},

			removeFromCart: (id: string) =>
				set({
					cart: get().cart.filter((item) => item.id !== id),
				}),

			updateQuantity: (id: string, qty: number) =>
				set({
					cart: get().cart.map((item) =>
						item.id === id
							? { ...item, quantity: Math.max(1, qty) }
							: item,
					),
				}),

			clearCart: () => set({ cart: [] }),

			getSubtotal: () =>
				get().cart.reduce(
					(acc, item) => acc + item.price * item.quantity,
					0,
				),

			getVat: () => get().getSubtotal() * 0.075,

			getTotal: () => get().getSubtotal() + get().getVat(),
		}),
		{
			name: "oja-cart-storage",
		},
	),
);
