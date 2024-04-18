"use client";

/**
 * Update Page Name Form Component.
 * This component allows the user to update the name of a page.
 * @param title - The current title of the page.
 * @param onSubmit - The callback function to be called when the form is submitted.
 * @returns JSX.Element - The component to be rendered.
 */
import { Input } from "@/components/ui/input";

export default function UpdatePageNameForm({
	title,
	onSubmit,
}: {
	title: string;
	onSubmit: (name: string) => void;
}) {

 
	return (
		<div >
			<Input
				type='text'
				required
				placeholder='New Page Name'
				defaultValue={title}
				onChange={(e) => onSubmit(e.target.value)}
				onBlur={(e) => onSubmit(e.target.value)}
				className='h-10'
			/>
		</div>
	);
}
