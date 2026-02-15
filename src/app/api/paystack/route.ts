// src/app/service/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Basic server-side guard — amount must be a positive integer (kobo)
		if (!body.email || !body.amount || body.amount <= 0) {
			return NextResponse.json(
				{ error: "email and a positive amount are required" },
				{ status: 422 },
			);
		}

		const res = await fetch(
			"https://api.paystack.co/transaction/initialize",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: body.email,
					amount: body.amount,
					currency: "NGN",
					reference: body.ref,
					firstname: body.firstname,
					lastname: body.lastname,
					phone: body.phone,
					metadata: body.metadata ?? {},
				}),
			},
		);

		const data = await res.json();

		if (!data.status) {
			return NextResponse.json(
				{ error: data.message ?? "Paystack initialization failed" },
				{ status: 400 },
			);
		}

		// Only expose the access_code — never forward the full Paystack response
		return NextResponse.json({ access_code: data.data.access_code });
	} catch (err) {
		console.error("[paystack/initialize]", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
