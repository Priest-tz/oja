import React from "react";
import { Instagram, Facebook, Youtube, Send, Mail } from "lucide-react";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12 text-center md:text-left">
				{/* LEFT: Brand Identity */}
				<div className="max-w-xs flex flex-col items-center md:items-start">
					<h2 className="text-[24px] font-black tracking-tighter mb-3">
						ỌJÀ
					</h2>
					<p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-[0.15em]">
						Elevated essentials for the modern lifestyle.
					</p>
					<div className="flex gap-5 mt-6 text-gray-400">
						<Instagram
							size={16}
							className="hover:text-black cursor-pointer transition-colors"
						/>
						<Facebook
							size={16}
							className="hover:text-black cursor-pointer transition-colors"
						/>
						<Youtube
							size={16}
							className="hover:text-black cursor-pointer transition-colors"
						/>
					</div>
				</div>

				{/* RIGHT: Links & Newsletter */}
				<div className="flex flex-col md:flex-row gap-12 md:gap-20 w-full md:w-auto items-center md:items-start">
					{/* Quick Links */}
					<div className="flex flex-col space-y-2.5 items-center md:items-start">
						<h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-1">
							Help
						</h3>
						<a
							href="#"
							className="text-[11px] uppercase tracking-widest hover:text-gray-400 transition-colors">
							Returns
						</a>
						<a
							href="#"
							className="text-[11px] uppercase tracking-widest hover:text-gray-400 transition-colors">
							Privacy
						</a>
						<a
							href="#"
							className="flex items-center gap-2 text-[11px] uppercase tracking-widest hover:text-gray-400 transition-colors">
							<Mail size={12} /> Contact
						</a>
					</div>

					{/* Newsletter Section */}
					<div className="min-w-64 flex flex-col items-center md:items-start">
						<h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">
							Join the list
						</h3>
						<div className="relative border-b border-black pb-1.5 flex items-center w-full max-w-xs md:max-w-none">
							<input
								type="email"
								placeholder="YOUR EMAIL"
								className="w-full bg-transparent outline-none text-[11px] tracking-[0.2em] placeholder:text-gray-300 text-center md:text-left"
							/>
							<button className="hover:translate-x-1 transition-transform pl-2">
								<Send size={14} />
							</button>
						</div>
						<p className="text-[9px] text-gray-400 uppercase tracking-widest mt-3">
							Unlock early access and exclusive drops.
						</p>
					</div>
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
				<p className="text-[9px] uppercase tracking-[0.4em] text-gray-400">
					© {currentYear} ỌJÀ — All Rights Reserved
				</p>
				<div className="flex gap-6 text-[9px] uppercase tracking-[0.2em] text-gray-300">
					<span>Lagos</span>
					<span>London</span>
					<span>New York</span>
				</div>
			</div>
		</footer>
	);
}
