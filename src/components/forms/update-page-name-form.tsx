"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { on } from "events";

export default function UpdatePageNameForm({
	index,
	title,
	onSubmit,
}: {
	index: number;
	title: string;
	onSubmit: (name: string) => void;
}) {
	const [name, setName] = useState<string>("");

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSubmit(name);
	};

	return (
		<form onSubmit={(e) => handleSubmit(e)}>
			<Input
				type='text'
				placeholder='New Page Name'
				defaultValue={title}
				onChange={(e) => onSubmit(e.target.value)}
				onBlur={(e) => onSubmit(e.target.value)}
				className='h-10'
			/>
		</form>
	);
}
