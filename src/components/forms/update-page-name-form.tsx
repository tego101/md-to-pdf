"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

export default function UpdatePageNameForm({
    index,
    title,
    onSubmit,
}:{
    index: number;
    title:  string;
    onSubmit: (name: string) => void;
}) {
    const [name, setName] = useState<string>("");
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(name);
    };

	return (
		<form
            onSubmit={(e) => handleSubmit(e)}
        >
			<Input type="text" placeholder="New Page Name" 
        
                defaultValue={title}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="w-full flex flex-row items-center justify-end">
            <Button
                type="submit"
                variant="outline"
                className="mt-2"
            >
                Update
            </Button>
            </div>
		</form>
	);
}