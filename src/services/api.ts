export const fetchProducts = async (
	page: number = 1,
	limit: number = 12,
	category?: string,
	search?: string,
) => {
	const baseUrl = "https://api.oluwasetemi.dev/products";
	const url = new URL(baseUrl);
	url.searchParams.append("page", page.toString());
	url.searchParams.append("limit", limit.toString());

	if (category && category !== "All") {
		url.searchParams.append("category", category);
	}
	if (search) {
		url.searchParams.append("name", search);
	}

	const res = await fetch(url.toString());
	if (!res.ok) throw new Error("Failed to fetch products");
	return res.json();
};
