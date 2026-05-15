import { useEffect, useState } from "react";
import supabase from "../supabaseCreatedClient.js";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import google_icon from "../assets/google_icon.svg";
import side_image from "../assets/side_image.png";

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
			checkAndRedirect(session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			checkAndRedirect(session);
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
		<div className="bg-yellow-950 w-screen h-screen flex items-center justify-center">
			<div className="max-w-380 w-screen h-screen flex items-center justify-evenly">
				<div>
					<img src={side_image} alt="" />
				</div>
				<div className="flex flex-col items-center gap-2">
					<h1 className="text-amber-400 text-4xl">Notes App</h1>
					<p className="text-gray-100 text-xl mb-10">
						from your life stories to your beliefs, all in one place
					</p>
					<button
						className="bg-white text-yellow-950 rounded-full px-10 p-2 cursor-pointer flex gap-2 aline-center w-fit"
						onClick={handleLogin}
					>
						<img src={google_icon} className="w-4" alt="G" />
						Login with Google
					</button>
				</div>
			</div>
		</div>
	);
}
