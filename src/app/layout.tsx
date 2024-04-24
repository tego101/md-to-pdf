import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import { GeistSans } from "geist/font/sans";

import { ThemeProvider } from "@/lib/providers";
import "./globals.css";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "MD-TO-PDF",
	description: "Generate PDF from Markdown"
};


export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body
				className={cn(
					"transition-all dark  duration-500 ease-in-out min-h-screen font-sans bg-black antialiased ov",
					GeistSans.variable
				)}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>

						<main>{children}</main>

					<Toaster />
				</ThemeProvider>
				<Analytics/>
			</body>
		</html>
	);
}
