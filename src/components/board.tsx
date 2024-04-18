"use client";

// React.
import { Suspense, useEffect, useRef, useState } from "react";

// Framer.
import { motion } from "framer-motion";

// Markdown Libraries.
import { marked } from "marked";
import moment from "moment";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// NextJS.
import Link from "next/link";

// UI Components.
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";

// Icons.
import {
	File,
	Github,
	Link2,
	Loader,
	Pencil,
	Plus,
	Save,
	Trash2,
} from "lucide-react";

// Form Components.
import UpdatePageNameForm from "@/components/forms/update-page-name-form";

// Type(s).
export interface Page {
	title: string;
	content: string;
}

/**
 * Board Component.
 * This includes the board layout, input textarea and viewer.
 * @returns JSX.Element
 */
export default function Board() {
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	// :) Fresh Toast.
	const { toast } = useToast();

	// Booleans.
	const [loading, setLoading] = useState<boolean>(true);
	const [processing, setProcessing] = useState<boolean>(false);

	// Pages.
	const [pages, setPages] = useState<Page[]>([]);
	const [currentPage, setCurrentPage] = useState<string>();

	// Add some initial pages on mount
	useEffect(() => {
		const initialPages: Page[] = [
			{
				title: "Page 1",
				content: `
				# Hi!
                ## I have built this Mark Down to PDF tool for you to use for FREE.
                ### Erase this and enter your content.
                ---
                ## x profile https://www.x.com/tegodotdev
                ## https://tego.dev
                ---
                ## Built With:
                ### nextjs
                ### tailwindcss
                ### shadcn-ui
				`.replace(/^[ \t]+/gm, ""),
			},
		];
		setPages(initialPages);
		setCurrentPage(initialPages[0].title);
		setLoading(false);
	}, []);

	// Adds a new page and switches to it.
	const addPage = () => {
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

		setCurrentPage(`Page ${newPageID}`);
	};

	// Deletes selected page after confirmation.
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

	// Converts current page to PDF.
	const savePage = async () => {
		"use client";
		setProcessing(true);

		// Build html string from markdown.
		const content = await marked.parse(
			pages.find((p) => p.title === currentPage)?.content ?? ""
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

		try {
			var pdfName = `${currentPage}_${moment().utc()}_md-to-pdf_tegodotdev.pdf`;
			// @ts-ignore
			const { default: html2pdf } = await import("html2pdf.js");

			html2pdf(content.trim(), {
				enableLinks: true,
				filename: pdfName,
				pageBreak: {
					mode: ["avoid-all"],
					before: ["h2"],
					avoid: ["img"],
				},
				margin: 5,
				html2canvas: {
					scale: 2,
				},
				image: {
					type: "png",
					quality: 1,
				},
				jsPDF: {
					orientation: "portrait",
					unit: "mm",
					format: "letter",
					setTextColor: "#000000",
					putOnlyUsedFonts: true,
					compress: true,
				},
			});

			toast({
				title: "PDF generated!",
				description: "Your PDF has been successfully generated.",
			});

			setProcessing(false);
		} catch (error) {
			toast({
				title: "Something went wrong!",
				description:
					// @ts-ignore
					error.message ?? "There was an error while generating your PDF.",
				duration: 5000,
				variant: "destructive",
			});
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
			<div className='flex flex-col h-screen w-screen'>
				<div className='flex flex-row items-center h-auto w-auto'>
					<div className='bg-black relative top-0 w-full '>
						<div className=' flex  mx-4 bg-transparent flex-row items-center justify-between p-1'>
							<div className='p-3 flex flex-row items-center space-x-2'>
								<Button variant={`link`} asChild>
									<Link href='https://github.com/tego101/md-to-pdf'>
										<Github className='w-6 h-6' />
										<span className='ml-2'>Source (Coming soon)</span>
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
									variant={`default`}
									onClick={() => savePage()}>
									{processing ? (
										<Loader className='w-4 h-4 animate-spin' />
									) : (
										<Save />
									)}
									<span className='ml-2 font-semibold'>
										{processing ? "Please wait..." : "Convert to PDF"}
									</span>
								</Button>
							</div>
						</div>
					</div>
				</div>
				<div className='flex flex-row items-center h-screen w-screen'>
					<ResizablePanelGroup direction='horizontal' className='px-5'>
						<ResizablePanel className='w-1/2 h-full px-2 '>
							<Tabs
								defaultValue={currentPage}
								value={currentPage}
								className='h-full w-full overflow-y-auto'>
								<motion.div
									initial={{ opacity: 0, filter: "blur(5px)" }}
									animate={{ opacity: 1, filter: "blur(0px)" }}
									transition={{ duration: 0.2 }}
									className='transition-all duration-500 ease-out m-2 flex flex-row items-center overflow-x-auto justify-between dark:bg-transparent p-1'>
									{pages.length > 0 ? (
										<TabsList className='bg-transparent'>
											{pages.map((page, index) => (
												<motion.div
													initial={{ opacity: 0, filter: "blur(5px)", x: 100 }}
													animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
													transition={{ duration: 0.2 }}
													exit={{ opacity: 0, filter: "blur(5px)", x: 100 }}
													key={index}
													className='dark:bg-transparent dark:border-none flex flex-row items-center justify-between'>
													<TabsTrigger
														value={page.title}
														onClick={() => setCurrentPage(page.title)}
														className='border-l-4 border-slate-700 dark:border-slate-900 '>
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
														<PopoverContent className='padding-0 margin-0'>
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
												</motion.div>
											))}
										</TabsList>
									) : null}
									<motion.div
										initial={{ opacity: 0, filter: "blur(5px)" }}
										animate={{ opacity: 1, filter: "blur(0px)" }}
										transition={{ duration: 0.2 }}
										className='border-l border-slate-200 dark:border-slate-900 pl-2'>
										<Button
											// onClick add a new page after the last index
											onClick={() => addPage()}
											variant={`default`}
											size={`sm`}
											className='shadow rounded-full px-4'>
											<Plus className='w-4 h-4' />
										</Button>
									</motion.div>
								</motion.div>

								{pages.map((page, index) => (
									<TabsContent
										key={index}
										value={page.title}
										className='w-full border-t  border-slate-200 dark:border-slate-900 rounded-2xl p-4'>
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
											className='bg-gradient-to-b rounded-2xl text-slate-100 from-black to-slate-900/20 w-full overflow-y-auto border border-slate-700 ring-0 outline-none focus:border-none min-h-[400px] focus:outline-none focus:ring-0'
										/>
									</TabsContent>
								))}
							</Tabs>
						</ResizablePanel>

						<ResizableHandle
							withHandle
							className='border-none bg-gradient-to-b via-slate-200 to-slate-100 from-slate-100 dark:from-black dark:via-slate-700/20 dark:to-black '
						/>

						<ResizablePanel className='bg-gradient-to-l from-slate-900/40 rounded-r-xl w-full lg:w-1/2 h-full overflow-y-auto border-t-1 border-r-slate-700/80 border-t border-t-slate-7 border-r border-b-2   border-slate-400/10 '>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.2 }}
								className='h-screen w-full  text-white px-4  break-words overflow-y-auto'>
								<Markdown
									remarkPlugins={[[remarkGfm, { singleTilde: true }]]}
									className={`mb-10 h-auto`}>
									{(
										pages.find((p) => p.title === currentPage)?.content ?? ""
									).replace(/^[ \t]+/gm, "")}
								</Markdown>
							</motion.div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Suspense>
	);
}
