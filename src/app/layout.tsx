import type { Metadata } from "next";

import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/toaster"

import "./globals.css";
import AuthProvider, { ThemeProvider } from "@/lib/providers";

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
					"transition-all  duration-500 ease-in-out min-h-screen bg-white dark:bg-gradient-to-tr dark:from-black dark:to-slate-900 dark:text-white font-sans antialiased",
					GeistSans.variable
				)}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
					 
						<main>{children}</main>
					 
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
