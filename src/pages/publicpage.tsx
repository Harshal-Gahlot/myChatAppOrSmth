import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../supabaseCreatedClient";
import PostReaction from "../components/postReaction";
import CommentSection from "../components/commentSection";
import { Post } from "../utils/globalTypes";
import img1 from "@/assets/bridge.jpg";
import img2 from "@/assets/sky_birds.jpg";
import banner from "@/assets/banner.png";
import avatar from "@/assets/avatar.jpg";
import { ReactionButton } from "@/utils/postReactionBtn";

export default function PublicPage() {
	const { username, category } = useParams();
	const navigate = useNavigate();
	// below, 'null' means "req sent, checking if user exist". 'false' means "username doesn't exist". 'true' means "user exist"
	const [exists, setExists] = useState<boolean | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [showOldBeliefs, setShowOldBeliefs] = useState(false);

	useEffect(() => {
		async function fetchPublicData() {
			// finding the User ID from the username
			const { data: userData, error: userError } = await supabase
				.from("profiles")
				.select("id")
				.eq("username", username) 
				// TODO: in future if we wanted to add feature to repost, we have to fix this since rn it only fetches posts by the username
				.single();

			if (userError || !userData) {
				if (userError) console.log(userError);
				setExists(false);
				return;
			}

			// fetching the above username's posts

			let query = supabase
				.from("posts")
				.select("*, profiles!posts_user_id_profiles_fkey(username)")
				.eq("user_id", userData.id)
				.eq("is_public", true)
				.order("created_at", { ascending: false });

			if (category) {
				query = query.eq("type", category);
			}

			const { data: postsData, error: postsError } = await query;

			if (postsError) {
				console.log('postsError', postsError)
				setExists(false)
				return;
			}
			console.log('postsData', postsData)			
			if (postsData) {
				setPosts(postsData as Post[]);
			}
			setExists(true);
		}

		fetchPublicData();
	}, [username, category]);

	if (exists === null) return <h1> im Loading very fost fost! </h1>;
	if (exists === false) return <h1> username doesn't exist yet </h1>;

	return (
		<div className="max-w-2xl mx-auto p-6 pt-0">
			<header className="mb-12 text-center">
				<img src={banner} className="w-full mix-blend-multiply"></img>
				<img src={avatar} className="w-44 rounded-full absolute p-4 -translate-y-20" />
				<h1 className="text-4xl font-black text-gray-900 mb-2">@{username}</h1>
				<p className="text-gray-500">Digital Garden</p>
			</header>
			<div className="space-y-6">
				{posts.length === 0 && (
					<p className="text-center text-gray-400">
						This user hasn't posted anything yet.
					</p>
				)}
				{posts.map((post) => (
					<div
					// TODO: when clicked, do open up the that scroll page but not when user is selecting/high lighting some text on the scroll.
					// onClick={() => navigate(`/${post.profiles.username}/scroll/${post.id}`)}
					key={post.id}
					className="relative p-6 mb-8 border border-ink-light/40 bg-parchment-light rounded-sm" // shadow-sm hover:shadow-md transition-show"
					>
					{console.log("post.profile.username", post.profiles.username) ?? null}
						<div className="flex items-center mb-4 pb-2">
							{/* justify-between items-baseline border-b border-ink-light/20" */}
							<div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
								{post.type.replace("_", " ")}
							</div>
							<div className="px-2">·</div>
							<div className="text-xs text-gray-400">
								{new Date(post.created_at).toLocaleDateString()}
							</div>
						</div>
						{/* conditionally rendering belief reason */}
						{post.type === "belief" && post.metadata?.evo_history?.length > 0 && (
							<div>
								{post.type === "belief" &&
									post.metadata?.evo_history?.length > 1 && (
										<button
											className="px-4 py-2 text-sm rounded-sm tracking-wide font-bold text-ink bg-parchment-dark mb-4 
											border-3 border-parchment-outline shadow-ink inset-shadow-sm/50 hover:cursor-pointer
											hover:bg-parchment-darker" // hover:inset-shadow-sm/0 hover:shadow-sm"
											onClick={() => setShowOldBeliefs(!showOldBeliefs)}
										>
											{showOldBeliefs ? (
												"hide old beliefs"
											) : (
												<div>
													View previous +
													{post.metadata?.evo_history?.length - 1}
												</div>
											)}
										</button>
									)}

								{showOldBeliefs ? (
									<div>
										{post.metadata.evo_history.map(
											(history_item: any, index: number) => (
												<div key={index} className="text-sm">
													<p className="text-gray-400 line-through decoration-red-300">
														{history_item.evolved_from}
													</p>
													<p className="text-xs text-blue-500 font-medium mt-1">
														<span className="italic"> Reason:</span>
														{" " + history_item.reason}
													</p>
												</div>
											),
										)}
									</div>
								) : (
									<div className="space-y-3 mb-3 border-l-2 border-blue-200 pl-3 text-sm text-gray-500">
										{console.log(post.metadata?.evo_history) ?? null}
										<p className="line-through">
											{
												post.metadata!.evo_history[
													post.metadata?.evo_history?.length - 1
												]?.evolved_from
											}
										</p>
										<p>
											{"Reason: " +
												post.metadata!.evo_history[
													post.metadata?.evo_history?.length - 1
												]?.reason}
										</p>
									</div>
								)}
							</div>
						)}
						{/* Main text */}
						<p className="text-lg whitespace-pre-wrap leading-relaxed text-ink">
							{post.content}{" "}
						</p>
						{/* conditionally rendering quote source  */}
						{post.type === "quote" && post.metadata?.source && (
							<div className="mt-4 text-sm text-gray-500 font-serif italic">
								- {post.metadata.source}
							</div>
						)}
						{/* Reaction and Comments Bar */}
						<div className="flex flex-col gap-0 border-t border-gray-100 mt-4 pt-2">
							<PostReaction postId={post.id} postType={post.type} />

							<div className="mt-4">
								{ReactionButton({
									type: "string",
									onClicked: () => navigate(`/${post.profiles.username}/scroll/${post.id}`), 
									myReaction: null,
									counts: { comment: 3 },
									hugeIcon: "comment",
									setColor: {
										normal: "text-sm text-gray-500 hover:text-blue-600 font-medium",
										preOnPress: "",
										postOnPress: "",
										fill: "",
									},
								})}
							</div>
							{/* <CommentSection
								post_id={post.id}
								allow_comments={post.allow_comments}
								post_owner_id={post.user_id}
							/> */}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
