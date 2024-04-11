"use server";

import fs from "fs";
import { marked } from "marked";
import path from "path";
import puppeteer from "puppeteer";

/**
 * CreatePDF
 * Creates a PDF from markdown and styles it using tailwindcss.
 * @param rawMarkdown
 */
export const CreatePDF = async (markdownContent: string | Promise<string>) => {
	// Ensure markdownContent is a string
	const markdownString = await (typeof markdownContent === "string"
		? markdownContent
		: markdownContent);

	// Parse Markdown to HTML
	const html = marked(markdownString);
	const tailwindCssPath = path.join(process.cwd(), ".next/static/css/globals.css");
	const tailwindCss = fs.readFileSync(tailwindCssPath, "utf-8");

	// Launch a new browser instance
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Set HTML content
	await page.setContent(html as string, { waitUntil: "networkidle0" });
	await page.addStyleTag({ content: tailwindCss });

	// Generate PDF
	const pdfBuffer = await page.pdf({ format: "A4" });

	// Close the browser instance
	await browser.close();

	// Convert pdfBuffer to Base64 string
	const base64Pdf = pdfBuffer.toString("base64");

	return base64Pdf;
};
