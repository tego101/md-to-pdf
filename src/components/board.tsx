"use client";

/**
 * Board Component.
 * This component contains the board layout, input textarea and viewer.
 * @returns JSX.Element - The component to be rendered.
 */

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
import Image from "next/image";
import Link from "next/link";

// UI Components.
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

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

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Loader className="w-12 h-12 dark:text-white animate-spin" />
    </div>
  );
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
                ## I built this Mark Down to PDF tool for you to use for FREE.
                ---
                ---
                ## Coming Soon:
                ### Currently the pages are saved in memory and will be lost on refresh.
                ### - Save pages to local storage.
                ### - Shortlink to share your pages.
                ## Stay tuned!
                ---
                #### Feel Free to contribute on Github!
                ---
                ## How to use:
                ### Erase this and enter your content.
                ### You can create up to 4 pages.
                ---
                ![tego.dev](/tego.png)
                ## x(twitter): https://x.com/tegodotdev
                ## portfolio: https://tego.dev
                ## git: https://github.com/tego101
                ---
                ## Built With:
                ### [NextJS](https://nextjs.org)
                ### [tailwindcss](https://tailwindcss.com)
                ### [shadcn-ui](https://ui.shadcn.com/)
                ---
                ## Hosted on [Vercel](https://vercel.com)
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
    setProcessing(true);
    // Build html string from markdown.
    const content = await marked.parse(
      pages.find((p) => p.title === currentPage)?.content ?? "",
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
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col h-screen w-screen">
        <div className="flex flex-row items-center h-auto w-auto">
          <div className="lg:hidden flex w-full flex-col m-8">
            <h1 className="text-2xl font-bold dark:text-white">
              Works best on desktop.
            </h1>
            <p className="text-sm text-slate-400">
              This tool is best used on a large display.
            </p>
            <div className=" flex flex-col items-start pt-4 space-y-2">
              <Button variant={`link`} asChild>
                <Link
                  className="decoration-none underline-none"
                  href="https://github.com/tego101/md-to-pdf"
                >
                  <Github className="w-8 h-8" />
                  <span className="ml-2 font-semibold">Open Source</span>
                </Link>
              </Button>
              <Button
                className="flex items-center flex-row"
                variant={`link`}
                asChild
              >
                <Link href="https://www.x.com/tegodotdev">
                  <Image
                    src="https://github.com/tego101.png"
                    alt="twitter"
                    width={1080}
                    height={1080}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ml-2">
                    Follow Me on{" "}
                    <strong className="font-bold text-2xl">x</strong>
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <ResizablePanelGroup direction="horizontal" className="p-4">
            <ResizablePanel className="w-1/2 h-full px-2  hidden lg:flex">
              <Tabs
                defaultValue={currentPage}
                value={currentPage}
                className="h-full w-full overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, filter: "blur(5px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.2 }}
                  className="transition-all duration-500 ease-out m-2 flex flex-row items-center overflow-x-auto justify-between dark:bg-transparent p-1"
                >
                  {pages.length > 0 ? (
                    <TabsList className="bg-transparent">
                      {pages.map((page, index) => (
                        <motion.div
                          initial={{ opacity: 0, filter: "blur(5px)", x: 100 }}
                          animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                          transition={{ duration: 0.2 }}
                          exit={{ opacity: 0, filter: "blur(5px)", x: 100 }}
                          key={index}
                          className="dark:bg-transparent dark:border-none flex flex-row items-center justify-between"
                        >
                          <TabsTrigger
                            value={page.title}
                            onClick={() => setCurrentPage(page.title)}
                            className="border-l-4 border-slate-700 dark:border-slate-900 "
                          >
                            <motion.div
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-row items-center justify-between"
                            >
                              <File
                                className={`w-4 h-4 mr-2 dark:text-[#${Math.floor(
                                  Math.random() * 16777215,
                                ).toString(16)}]`}
                              />

                              <span>{page.title}</span>
                            </motion.div>
                          </TabsTrigger>
                          <Popover>
                            <PopoverTrigger className=" ml-2" asChild>
                              <Button variant={`link`} size={`sm`}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="padding-0 margin-0">
                              <UpdatePageNameForm
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
                                        newPages[index].title ?? page.title,
                                      );

                                      return newPages;
                                    })
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <Button
                            variant={"link"}
                            size="sm"
                            onClick={() => deletePage(index)}
                            className="flex flex-row items-center space-x-2 mx-2"
                          >
                            <Trash2 className="w-4 h-4 text-slate-500 hover:text-slate-600 dark:text-red-400 dark:hover:text-red-500" />
                          </Button>
                        </motion.div>
                      ))}
                    </TabsList>
                  ) : null}
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(5px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.2 }}
                    className="border-l border-slate-200 dark:border-slate-900 pl-2"
                  >
                    <Button
                      // onClick add a new page after the last index
                      onClick={() => addPage()}
                      variant={`default`}
                      size={`sm`}
                      className="shadow rounded-full px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>

                {pages.map((page, index) => (
                  <TabsContent
                    key={index}
                    value={page.title}
                    className="w-full h-screen border-t  border-slate-200 dark:border-slate-900 rounded-2xl"
                  >
                    <Textarea
                      id={page.title}
                      onChange={(e) =>
                        setPages(
                          pages.map((p, i) =>
                            i === index ? { ...p, content: e.target.value } : p,
                          ),
                        )
                      }
                      disabled={processing}
                      value={page.content.replace(/^[ \t]+/gm, "")}
                      className="h-screen bg-slate-900/10 text-slate-100  border-none w-full overflow-y-auto  ring-0 outline-none focus:border-none min-h-[400px] focus:outline-none focus:ring-0"
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className=" hidden lg:flex border-none bg-gradient-to-b via-slate-200 to-slate-100 from-slate-100 dark:from-black dark:via-slate-700/20 dark:to-black "
            />

            <ResizablePanel className=" hidden lg:flex h-full rounded-r-xl w-auto lg:w-1/2 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-auto overflow-y-auto w-full  text-white px-4  break-words"
              >
                <nav className=" flex bg-gradient-to-r from-black via-slate-900/20 to-black flex-row items-center justify-between py-3">
                  <div className=" flex flex-row items-center space-x-2">
                    <Button variant={`link`} asChild>
                      <Link
                        className="decoration-none underline-none"
                        href="https://github.com/tego101/md-to-pdf"
                      >
                        <Github className="w-8 h-8" />
                        <span className="ml-2 font-semibold">Open Source</span>
                      </Link>
                    </Button>
                    <Button
                      className="flex items-center flex-row"
                      variant={`link`}
                      asChild
                    >
                      <Link href="https://www.x.com/tegodotdev">
                        <Image
                          src="https://github.com/tego101.png"
                          alt="twitter"
                          width={1080}
                          height={1080}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="ml-2">
                          Follow Me on{" "}
                          <strong className="font-bold text-2xl">x</strong>
                        </span>
                      </Link>
                    </Button>
                  </div>
                  <div className="space-x-4 flex flex-row items-center">
                    <Button
                      disabled
                      variant={`outline`}
                      onClick={() => toast({ title: "Coming soon..." })}
                    >
                      <Link2 />
                      <span className="ml-2">Link to PDF</span>
                    </Button>
                    <Button
                      disabled={processing}
                      variant={`default`}
                      onClick={() => savePage()}
                    >
                      {processing ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save />
                      )}
                      <span className="ml-2 font-semibold">
                        {processing ? "Please wait..." : "Convert to PDF"}
                      </span>
                    </Button>
                  </div>
                </nav>
                <Markdown
                  remarkPlugins={[[remarkGfm, { singleTilde: true }]]}
                  className={`mb-10 h-auto border-t border-slate-800`}
                >
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
