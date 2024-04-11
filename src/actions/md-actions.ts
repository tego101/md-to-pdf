"use server";

import path from "path";
import puppeteer from "puppeteer";
import { marked } from "marked";
import { put } from "@vercel/blob";

const tailwindCssContent = `
  // ... (your CSS content here)
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
  const browser = await puppeteer.launch();

  if (process.env.NODE_ENV !== "development") {
    puppeteer.launch = puppeteer.launch.bind(puppeteer, {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.VERCEL_CHROME_PATH || '/usr/bin/google-chrome-stable',
    });
  }

  const page = await browser.newPage();

  // Set HTML content
  await page.setContent(html as string, { waitUntil: "networkidle0" });

  // Add the CSS content as a style tag
  await page.addStyleTag({ content: tailwindCssContent });

  // Generate PDF
  const pdfBuffer = await page.pdf({ format: "A4" });

  // Close the browser instance
  await browser.close();

  // Store the PDF in Vercel's blob storage
  const blob = await put(`pdfs/${Date.now()}.pdf`, pdfBuffer, { access: 'public' });

  // Return the URL to the stored PDF
  return blob.url;
};