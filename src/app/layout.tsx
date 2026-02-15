import type { Metadata } from "next";
import { Questrial } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react"; // 1. Import Suspense
import "./globals.css";

const questrial = Questrial({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-questrial",
});

export const metadata: Metadata = {
	title: "ỌJÀ | Luxury E-commerce",
	description: "AltSchool Capstone Project",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${questrial.variable} antialiased`}>
				<Suspense fallback={<div className="h-16 bg-white border-b" />}>
					<Navbar />
				</Suspense>

				{children}
				<Footer />
			</body>
		</html>
	);
}
