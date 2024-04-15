"use client";

import { m, motion } from "framer-motion";

import Markdown from "react-markdown";
import generatePDF, { usePDF } from "react-to-pdf";
import remarkGfm from "remark-gfm";
import { marked } from "marked";

import { Button } from "@/components/ui/button";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import {
	File,
	FilePlus2,
	Github,
	Link2,
	Loader,
	Pencil,
	Save,
	Trash2,
} from "lucide-react";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import UpdatePageNameForm from "./forms/update-page-name-form";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "./ui/resizable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface Pages {
	title: string;
	content: string;
}

export default function Board() {
	const { toast } = useToast();
	const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });

	const [loading, setLoading] = useState<boolean>(true);
	const [processing, setProcessing] = useState<boolean>(false);
	const [pages, setPages] = useState<Pages[]>([]);
	const [currentPage, setCurrentPage] = useState<string>();

	useEffect(() => {
		// Add some initial pages on mount
		const initialPages = [
			{
				title: "Page 1",
				content: `# Hi!
                ## I have built this Mark Down to PDF tool for you to use for FREE.
                ### Erase this and enter your content.
                ---
                ## x profile https://www.x.com/tegodotdev
                ## https://tego.dev
                ---
                ## Built With:
                ### nextjs
                ### tailwindcss
                ### shadcn-ui`,
			},
		];
		setPages(initialPages);
		setCurrentPage(initialPages[0].title);
		setLoading(false);
	}, []);

	const addPage = () => {
		// a new page and switch to it.
		const newPageID = pages?.length + 1;
		if (newPageID > 4) {
			toast({
				title: "Maximum number of pages reached",
				description: "You can only have 4 pages.",
				variant: "destructive",
				duration: 5000,
			});
			return;
		}
		const newPage = [
			...pages,
			{ title: `Page ${newPageID}`, content: `# Hi! from page ${newPageID}` },
		];
		setPages(newPage);
		console.log("111--->", newPageID);
		setCurrentPage(`Page ${newPageID}`);
	};

	const deletePage = (index: number) => {
		if (confirm("Are you sure you want to delete this page?")) {
			const newPages = [...pages];

			if (currentPage === pages[index].title) {
				setCurrentPage(newPages[0].title);
				newPages.splice(index, 1);
				setPages(newPages);
			}
			newPages.splice(index, 1);
			setPages(newPages);
		}
	};

	function base64ToBlob(base64: string, contentType: any) {
		const byteCharacters = atob(
			base64.replace(/^data:[a-z]+\/[a-z]+;base64,/, "")
		);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += 512) {
			const slice = byteCharacters.slice(offset, offset + 512);
			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		return new Blob(byteArrays, { type: contentType });
	}

	const savePage = async () => {
		setProcessing(true);

		// Build html string from markdown.
		const content = marked.parse(
			pages
				.find((p) => p.title === currentPage)
				?.content.replace(/^[ \t]+/gm, "") ?? ""
		);

		toast({
			title: "Processing your PDF...",
			description: "This may take a few seconds.",
			duration: 2000,
		});

		if (!content) {
			toast({
				title: "Error",
				description: "The page is empty.",
				variant: "destructive",
			});
			setProcessing(false);
			return;
		}

		// @ts-ignore
		if (content.length < 50) {
			toast({
				title: "Error",
				description: "Content is too short.",
				variant: "destructive",
			});
			setProcessing(false);
			return;
		}

		try {
			const pdfName = `${currentPage}_${Date()}_md-to-pdf_tegodotdev.pdf`;

			console.log("content", content);

			// Convert html to pdf.

			toast({
				title: "PDF generated!",
				description: "Your PDF has been successfully generated and downloaded.",
				duration: 5000,
			});
		} catch (error) {
			console.error("Error in generating PDF", error);
			toast({
				title: "Something went wrong!",
				description:
					// @ts-ignore
					error.message ?? "There was an error while generating your PDF.",
				duration: 5000,
				variant: "destructive",
			});
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center h-screen w-full'>
				<Loader className='w-12 h-12 dark:text-white animate-spin' />
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className='flex flex-col items-center justify-center h-screen w-full'>
					<Loader className='w-12 h-12 dark:text-white animate-spin' />
				</div>
			}>
			<div className='flex flex-row items-center h-screen w-screen'>
				<ResizablePanelGroup
					direction='horizontal'
					className='shadow-2xl shadow-slate-600/20'>
					<ResizablePanel className='w-1/2 h-full p-2 bg-gradient-to-br from-slate-300 to-white dark:from-gray-900/10 dark:to-black/80 border-l-2 dark:border-l-slate-900/40 dark:border-b-slate-900/10 border-b-2 dark:border-t-slate-900/80'>
						<Tabs
							defaultValue={currentPage}
							value={currentPage}
							className='h-full w-full overflow-y-auto'>
							<div className='m-2 flex flex-row items-center justify-between overflow-x-auto dark:bg-transparent p-1'>
								{pages.length > 0 ? (
									<TabsList className='bg-transparent'>
										{pages.map((page, index) => (
											<div
												key={index}
												className='dark:bg-transparent dark:border-none flex flex-row items-center justify-between'>
												<TabsTrigger
													value={page.title}
													onClick={() => setCurrentPage(page.title)}
													className='border-l-4 border-slate-400 dark:border-slate-900 '>
													<motion.div
														key={index}
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{ duration: 0.2 }}
														className='flex flex-row items-center justify-between'>
														<File
															className={`w-4 h-4 mr-2 dark:text-[#${Math.floor(
																Math.random() * 16777215
															).toString(16)}]`}
														/>

														<span>{page.title}</span>
													</motion.div>
												</TabsTrigger>
												<Popover>
													<PopoverTrigger className=' ml-2' asChild>
														<Button variant={`link`} size={`sm`}>
															<Pencil className='w-4 h-4' />
														</Button>
													</PopoverTrigger>
													<PopoverContent>
														<UpdatePageNameForm
															index={index}
															title={page.title}
															onSubmit={
																// update page name for index.
																(name) =>
																	setPages((pages) => {
																		const newPages = [...pages];
																		newPages[index] = {
																			...newPages[index],
																			title: name,
																		};

																		setCurrentPage(
																			newPages[index].title ?? page.title
																		);

																		return newPages;
																	})
															}
														/>
													</PopoverContent>
												</Popover>
												<Button
													variant={"link"}
													size='sm'
													onClick={() => deletePage(index)}
													className='flex flex-row items-center space-x-2 mx-2'>
													<Trash2 className='w-4 h-4 text-slate-500 hover:text-slate-600 dark:text-red-400 dark:hover:text-red-500' />
												</Button>
											</div>
										))}
									</TabsList>
								) : null}
								<div>
									<Button
										// onClick add a new page after the last index
										onClick={() => addPage()}
										variant={`link`}>
										<FilePlus2 />
									</Button>
								</div>
							</div>
							{pages.map((page, index) => (
								<TabsContent
									key={index}
									value={page.title}
									className='w-full h-full overflow-y-auto border-t  border-slate-100/90 dark:border-slate-900'>
									<Textarea
										id={page.title}
										onChange={(e) =>
											setPages(
												pages.map((p, i) =>
													i === index ? { ...p, content: e.target.value } : p
												)
											)
										}
										disabled={processing}
										value={page.content.replace(/^[ \t]+/gm, "")}
										className='bg-transparent w-full overflow-y-auto border-none ring-0 h-full focus:border-none rounded-none'
									/>
								</TabsContent>
							))}
						</Tabs>
					</ResizablePanel>

					<ResizableHandle
						withHandle
						className='border-none bg-gradient-to-b via-slate-200 to-slate-100 from-slate-100 dark:from-black dark:via-slate-700/20 dark:to-black '
					/>

					<ResizablePanel className='bg-white dark:bg-black/50 w-1/2 h-full overflow-y-auto border-t-2 border-r border-b-2 border-slate-400/10'>
						<div className=' flex border-b border-b-slate-100/80 dark:border-slate-900/80 mx-4 bg-transparent flex-row items-center justify-between p-1'>
							<div className='p-3 flex flex-row items-center space-x-2'>
								<Button variant={`link`} asChild>
									<Link href='https://github.com/tego101/md-to-pdf'>
										<Github className='w-6 h-6' />
										<span className='ml-2'>Source</span>
									</Link>
								</Button>
								<Button variant={`link`} asChild>
									<Link href='https://www.x.com/tegodotdev'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='24'
											height='24'
											fill='currentColor'
											className='bi bi-twitter-x'
											viewBox='0 0 16 16'>
											<path d='M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z' />
										</svg>
										<span className='ml-2'>Follow Me</span>
									</Link>
								</Button>
							</div>
							<div className='space-x-4 flex flex-row items-center'>
								<Button
									disabled
									variant={`outline`}
									onClick={() => toast({ title: "Coming soon..." })}>
									<Link2 />
									<span className='ml-2'>Link to PDF</span>
								</Button>
								<Button
									disabled={processing}
									variant={`outline`}
									onClick={() => savePage()}>
									{processing ? (
										<Loader className='w-4 h-4 animate-spin' />
									) : (
										<Save />
									)}
									<span className='ml-2'>
										{processing ? "Please wait..." : "Save as PDF"}
									</span>
								</Button>
							</div>
						</div>
						<motion.div
							ref={targetRef}
							id='wrapper'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.2 }}
							className='h-screen w-full overflow-y-auto px-4 break-words'>
							<Markdown
								remarkPlugins={[[remarkGfm, { singleTilde: true }]]}
								className={`mb-40 h-auto`}>
								{(
									pages.find((p) => p.title === currentPage)?.content ?? ""
								).replace(/^[ \t]+/gm, "")}
							</Markdown>
						</motion.div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
			<style jsx global>
				{`
					body {
					}
				`}
			</style>
		</Suspense>
	);
}
