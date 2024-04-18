// 
import { RefObject, useEffect } from "react";

import { Page } from "../board";

/**
 * Autosize Text Areas.
 * This function will autosize the textarea(s) based on the content.
 * @param refs - Array of textarea refs.
 * @param pages - Array of pages.
 * @returns void
 */
const useAutosizeTextAreas = (
	refs: RefObject<HTMLTextAreaElement>[],
	pages: Page[]
) => {
	useEffect(() => {
		if (!refs || !pages) return;

		refs.forEach((ref: RefObject<HTMLTextAreaElement>, index: number) => {
			if (ref.current && pages[index]) {
				const currentRef = ref.current;
				currentRef.style.height = "0px";
				const scrollHeight = currentRef.scrollHeight;
				currentRef.style.height = scrollHeight + "px";
			}
		});
	}, [refs, pages]);
};

export default useAutosizeTextAreas;
