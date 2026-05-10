import React, { useState } from "react";
import supabase from "../supabaseCreatedClient";
import { CardDemo } from "@/components/formCard";

export default function SetupPage() {
	const [username, setUsername] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		console.log("submitting username: ", username);

		const {
			data: { user },
		} = await supabase.auth.getUser();
		const { error } = await supabase.from("profiles").upsert({
			id: user?.id,
			username: username,
		});

		if (error) {
			alert(error.message);
		} else {
			alert("profile accepted");
		}
	}

	return (
		<div className="bg-yellow-950 w-screen h-screen grid place-items-center text-white placeholder:text-white">	
		<CardDemo/>
			{/* <form className="flex flex-col items-center" onSubmit={(e) => handleSubmit(e)}>
				<h1>Create profile</h1>
				<input
					type="text"
					name="username"
					id="usernameId"
					value={username}
					placeholder="write a username"
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button type="submit">Save</button>
			</form> */}
		</div>
	);
}
