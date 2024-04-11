"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CreatePDF } from "@/actions/md-actions";
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
	Link2,
	Loader,
	Pencil, Save, X
} from "lucide-react";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import UpdatePageNameForm from "./forms/update-page-name-form";
import Image from "next/image";

export interface Pages {
	title: string;
	content: string;
}

export default function Board() {
	const { toast } = useToast();

	const [loading, setLoading] = useState<boolean>(true);
	const [processing, setProcessing] = useState<boolean>(false);
	const [pages, setPages] = useState<Pages[]>([]);
	const [currentPage, setCurrentPage] = useState<string>();

	// Save type will be used to determine which pages to save all or the selected page or pages.
	const [saveType, setSaveType] = useState<string | [] | undefined>("all");

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
			{
				title: "Page 2",
				content: `# Empty... Start writing here.`,
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
				description: "You can only have 3 pages",
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

	const savePage = async () => {
		try {
			setProcessing(true);
			toast({
				title: "Processing your PDF...",
				description: "This may take a few seconds.",
				duration: 5000,
			});

			const base64Pdf = await CreatePDF(
				(pages.find((p) => p.title === currentPage)?.content ?? "").replace(
					/^[ \t]+/gm,
					""
				)
			);

			// Convert Base64 string to Uint8Array
			const pdfBuffer = Uint8Array.from(atob(base64Pdf), (c) =>
				c.charCodeAt(0)
			);

			// Create a Blob from the PDF buffer
			const blob = new Blob([pdfBuffer], { type: "application/pdf" });

			// Create a temporary URL for the PDF
			const url = URL.createObjectURL(blob);

			setProcessing(false);
			// Open the PDF in a new tab or window
			window.open(url);
		} catch (error) {
			console.error(error);
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
			<div className='flex flex-row items-center h-screen w-screen p-10'>
				<div className='w-1/2 h-full p-2 bg-black rounded-l-xl'>
					<Tabs
						defaultValue={currentPage ?? pages[0]?.title}
						className='h-full w-full overflow-y-auto'>
						<div className='m-2 flex dark:bg-black flex-row items-center justify-between overflow-x-auto dark:bg-transparent p-1'>
							{pages.length > 0 ? (
								<TabsList>
									{pages.map((page, index) => (
										<div
											key={index}
											className='dark:bg-transparent dark:border-none flex flex-row items-center justify-between'>
											<TabsTrigger
												value={page.title}
												onClick={() => setCurrentPage(page.title)}
												className="border-l-4 border-slate-400 dark:border-slate-700 "
												>
												<div className='flex flex-row items-center justify-between'>
													<File
														className={`w-4 h-4 mr-2 dark:text-[#${Math.floor(
															Math.random() * 16777215
														).toString(16)}]`}
													/>

													<span>{page.title}</span>
												</div>
											</TabsTrigger>
											<Popover>
												<PopoverTrigger
													className=' ml-2 dark:bg-slate-900'
													asChild>
													<Button variant={`ghost`} size={`sm`}>
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
																	return newPages;
																})
														}
													/>
												</PopoverContent>
											</Popover>
											<Button
												variant={"ghost"}
												onClick={() => deletePage(index)}
												className='flex flex-row items-center space-x-2'>
												<X className='w-4 h-4 text-red-400 hover:text-red-500' />
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
									className='bg-black w-full overflow-y-auto border-none ring-0 h-full focus:border-none rounded-none'
								/>
							</TabsContent>
						))}
					</Tabs>
				</div>
				<div className='bg-black/80 rounded-r-xl w-1/2 h-full overflow-y-auto'>
					<div className=' flex border-b border-b-slate-100/80 dark:border-slate-900/80 mx-4 bg-transparent flex-row items-center justify-between p-1'>
						<div className='p-3 flex flex-row items-center space-x-4'>
							<h1 className='text-lg font-bold dark:text-white/20 '>by</h1>
							<Image
								src='https://github.com/tego101.png'
								alt='tego101'
								width={40}
								height={40}
								className='rounded-full w-10 h-10'
							/>
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
									<span className='ml-2'>Follow Me on X</span>
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
					<div className='h-full w-full overflow-y-auto px-4 break-words'>
						<Markdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
							{(
								pages.find((p) => p.title === currentPage)?.content ?? ""
							).replace(/^[ \t]+/gm, "")}
						</Markdown>
					</div>
				</div>
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

/*	return (
		<Suspense
			fallback={
				<div className='flex flex-col items-center justify-center h-screen w-full'>
					<Loader className='w-12 h-12 dark:text-white animate-spin' />
				</div>
			}>
			<main className='flex min-h-screen flex-col h-screen justify-between overflow-y-auto'>
				<ResizablePanelGroup direction='horizontal'>
					<ResizablePanel className='flex flex-col h-full bg-gradient-to-br from-indigo-200/10 dark:from-gray-900/20 dark:to-black w-1/2'>
						<Tabs
							defaultValue={currentPage ?? pages[0]?.title}
							className='w-full h-full overflow-y-auto'>
							<div className='m-2 flex dark:bg-black flex-row items-center justify-between overflow-x-auto dark:bg-transparent p-1'>
								{pages.length > 0 ? (
									<TabsList>
										{pages.map((page, index) => (
											<div
												key={index}
												className='dark:bg-transparent dark:border-none flex flex-row items-center justify-between'>
												<TabsTrigger
													value={page.title}
													onClick={() => setCurrentPage(page.title)}>
													<div className='flex flex-row items-center justify-between'>
														<File
															className={`w-4 h-4 mr-2 dark:text-[#${Math.floor(
																Math.random() * 16777215
															).toString(16)}]`}
														/>

														<span>{page.title}</span>
													</div>
												</TabsTrigger>
												<Popover>
													<PopoverTrigger
														className=' ml-2 dark:bg-slate-900'
														asChild>
														<Button variant={`ghost`} size={`sm`}>
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
																		return newPages;
																	})
															}
														/>
													</PopoverContent>
												</Popover>
												<Button
													variant={"ghost"}
													onClick={() => deletePage(index)}
													className='flex flex-row items-center space-x-2'>
													<X className='w-4 h-4 text-red-400 hover:text-red-500' />
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
									className='border-t border-slate-100/90 dark:border-slate-900'>
									<Textarea
										id={page.title}
										onChange={(e) =>
											setPages(
												pages.map((p, i) =>
													i === index ? { ...p, content: e.target.value } : p
												)
											)
										}
										value={page.content.replace(/^[ \t]+/gm, "")}
										className='bg-orange-100/20 dark:bg-black/10   h-screen border-0 focus:border-none rounded-none'
									/>
								</TabsContent>
							))}
						</Tabs>
					</ResizablePanel>
					<ResizableHandle className='border-none' />
					<ResizablePanel className='border-none overflow-y-auto bg-amber-200/5 dark:bg-black pb-50'>
						<div className=' flex border-b border-b-slate-100/80 dark:border-slate-900/80 mx-4 bg-transparent flex-row items-center justify-between p-1'>
							<div className='p-2 flex flex-row items-center space-x-4'>
								<img
									src='https://github.com/tego101.png'
									alt='tego101'
									className='rounded-full w-10 h-10'
								/>
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
										<span className='ml-2'>Follow Me on X</span>
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
								<Button variant={`outline`} onClick={() => savePage()}>
									<Save />
									<span className='ml-2'>Save as PDF</span>
								</Button>
							</div>
						</div>
						<div className='h-screen pb-80 bg-gradient-to-tl pb-50 from-slate-100 dark:from-black/90 dark:text-white w-screen overflow-y-auto px-4 break-words'>
							<Markdown
								remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
								className='h-screen pb-40 bg-gradient-to-b from-white/40 dark:from-transparent'>
								{(
									pages.find((p) => p.title === currentPage)?.content ?? ""
								).replace(/^[ \t]+/gm, "")}
							</Markdown>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
		</Suspense>
	);
}
*/
