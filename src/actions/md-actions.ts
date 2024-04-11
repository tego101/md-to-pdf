"use server";

import path from "path";
import puppeteer from "puppeteer";
import { marked } from "marked";
import chromium from "@sparticuz/chromium";

// Styles.
const tailwindCssContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Global styles */
body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f7f7f7;
}

hr {
  margin-top: 10px;
  margin-bottom: 10px;
  border: 0;
  border-top: 1px solid var(--border);
}

/* Headings */
h1 {
  color: #968eff;
  font-size: 2.5rem;
  margin-top: 0;
  margin-bottom: 0;
  font-weight: 800;
}

h2 {
  font-weight: 600;
  font-size: 1.2rem;
}

h3 {
  font-weight: 500;
  font-size: 1rem;
}

/* Lists */
ul, ol {
  margin: 0 0 20px 0;
  padding-left: 20px;
}

li {
  margin-top: 2px;
  list-style-type: disc; /* Default list style for unordered lists */
}

ol li {
  list-style-type: decimal; /* Default list style for ordered lists */
}

/* Code blocks */
pre {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9rem;
}

/* Inline code */
code {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
  font-size: 0.9rem;
}

/* Strong and emphasized text */
strong, b {
  font-weight: bold;
}

em, i {
  font-style: italic;
}

/* Blockquotes */
blockquote {
  margin: 0;
  padding: 20px;
  background-color: #f0f0f0;
  border-left: 5px solid #968eff;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  margin: 10px 0; /* Add some margin around images */
}

/* Horizontal rule */
hr {
  margin-top: 10px;
  margin-bottom: 10px;
  border: 0;
  border-top: 1px solid var(--border);
}

/* Links */
a {
  color: rgb(218, 193, 254);
  text-decoration: underline;
  font-weight: 600;
  font-size: 1rem;
}

/* Tables (basic styles) */
table {
  border-collapse: collapse;
  width: 100%; /* Adjust width as needed */
  margin: 10px 0;
}

th, td {
  padding: 5px;
  border: 1px solid #ddd;
}

th {
  text-align: left;
  font-weight: bold;
}
`;

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

	// Launch a new browser instance
	const browser = await puppeteer.launch({
		args: chromium.args,
		defaultViewport: chromium.defaultViewport,
		executablePath: await chromium.executablePath(),
		headless: chromium.headless,
		ignoreHTTPSErrors: true,
	});

	const page = await browser.newPage();

	// Set HTML content
	await page.setContent(html as string, { waitUntil: "networkidle0" });

	// Add the CSS content as a style tag
	await page.addStyleTag({ content: tailwindCssContent });

	// Generate PDF
	const pdfBuffer = await page.pdf({ format: "A4" });

	// Close the browser instance
	await browser.close();

	// Convert pdfBuffer to Base64 string
	const base64Pdf = pdfBuffer.toString("base64");
	return base64Pdf;
};
