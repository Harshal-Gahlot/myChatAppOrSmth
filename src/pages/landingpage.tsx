import { useEffect, useState } from "react";
import supabase from "../supabaseCreatedClient.js";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
	const [user, setUser] = useState<User | null>(null);
	const navigate = useNavigate();

	useEffect(() => {

		async function checkAndRedirect(session: Session | null) {
			setUser(session?.user ?? null);
			if (session?.user) {
				const { data } = await supabase
					.from("profile")
					.select("username")
					.eq("id", session.user.id)
					.single();

					data?.username ? navigate("/dashboard") : navigate("/setup");
			}
		}

		supabase.auth.getSession().then(({ data: { session } }) => {
			checkAndRedirect(session)
		});

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			checkAndRedirect(session)
		});

		return () => subscription.unsubscribe();
	}, [navigate]);

	async function handleLogin() {
		await supabase.auth.signInWithOAuth({ provider: "google" });
	}

	if (user) {
		return <h1>You are logged in as: {user.email}</h1>;
	}

	return (
		<div>
			<h1>hii</h1>
			<button className="bg-blue-500 p-2" onClick={handleLogin}>
				login with google
			</button>
		</div>
	);
}
