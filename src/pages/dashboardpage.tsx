import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseCreatedClient";
import { PostType } from "./globalTypes";

interface Profile {
	username: string;
}

interface Post {
	id: string;
	content: string;
	type: PostType;
	created_at: string;
	allow_comments: boolean;
}

export default function Dashboard() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const navigate = useNavigate();
	const [postType, setPostType] = useState<PostType>("thought");
	const [content, setContent] = useState("");
	const [source, setSource] = useState("");
	const [allowComments, setAllowComments] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [myPosts, setMyPosts] = useState<Post[]>([]);

	// Fetching user profile and their previous posts
	useEffect(() => {
		async function fetchProfile() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return navigate("/");

			const { data } = await supabase
				.from("profiles")
				.select("username")
				.eq("id", user.id)
				.single();
			if (data) setProfile(data as Profile);

			fetchMyPosts(user.id)
		}
		fetchProfile();
	}, []);

	async function fetchMyPosts(userId: string) {
		const { data } = await supabase
			.from("posts")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (data) setMyPosts(data as Post[]);
	}

	async function createPost() {
		if (!content.trim()) return alert("write smth first!");
		setIsSubmitting(true);

		let metadata = {};
		if (postType === "quote") metadata = { source: source };

		const { error } = await supabase.from("posts").insert({
			user_id: (await supabase.auth.getUser()).data.user?.id,
			type: postType,
			content: content,
			metadata: metadata,
			allow_comments: allowComments,
		});

		setIsSubmitting(false);

		if (error) alert("error :" + error.message);
		else {
			fetchMyPosts((await supabase.auth.getUser()).data.user!.id);
			setContent("");
			setSource("");
		}
	}

	async function deletePost(postId: string) {
		if (!window.confirm("delete for sure?")) return;

		const { error } = await supabase.from("posts").delete().eq("id", postId);

		if (error) alert(error.message);
		else setMyPosts((prev) => prev.filter((p) => p.id !== postId));
	}

	if (!profile) return <h1>Loading</h1>;

	return (
		<div className="max-w-2xl mx-auto p-8">
			{/* Header section */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="py-4 text-3xl">Studio ({profile.username})</h1>

				<a
					href={`/${profile.username}`}
					target="_black"
					rel="noreferrer"
					className="text-blue-600"
				>
					View Public Page →
				</a>
			</div>

			<div className="p-4 bg-white shadow-lg rounded-xl border border-gray-100">
				<div className="flex justify-between">
					<h3>Create New</h3>

					<div className="mb-15px">
						<label>Type:</label>
						<select
							value={postType}
							onChange={(e) =>
								setPostType(e.target.value as PostType)
							}
							className="p-1 ml-2 text-blue-500"
						>
							<option value="thought">Thought</option>
							<option value="hot_take">Hot take</option>
							<option value="quote">Quote</option>
							<option value="belief">Belief</option>
							<option value="rule">Rule</option>
						</select>
					</div>
				</div>
				<textarea
					placeholder="what's on your mind"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={4}
					className="w-full mb-2 outline-none"
				></textarea>
				{postType === "quote" && (
					<div className="mb-2 py-1 flex">
						<label>Author:</label>
						<input
							type="text"
							placeholder="who said this?"
							value={source}
							onChange={(e) => setSource(e.target.value)}
							className="w-full px-2 outline-none"
						/>
					</div>
				)}

				{/* Allow Comments parameter */}
				<div className="flex items-center mb-4">
					<input
						type="checkbox"
						id="allowComments"
						checked={allowComments}
						onChange={(e) => setAllowComments(e.target.checked)}
						className="w-4 h-4 mr-2"
					/>

					<label
						htmlFor="allowComments"
						className="text-sm text-gray-500 cursor-pointer select-none"
					>
						Allow Comments
					</label>
				</div>

				<button
					onClick={createPost}
					disabled={isSubmitting}
					className="px-3 py-1 cursor-pointer text-white bg-gray-500 rounded-full hover:bg-blue-500"
				>
					{isSubmitting ? "saving..." : "Post"}
				</button>
			</div>

			<div className="mt-10">
				<h3 className="text-xl font-bold mb-4"> Your Archive</h3>

				<div className="space-y-4">
					{myPosts.length === 0 && (
						<p className="text-gray-400">
							You haven't created any posts
						</p>
					)}

					{myPosts.map((post) => (
						<div
							key={post.id}
							className="flex justify-between items-start bg-gray-50 border border-gray-200 p-4 rounded-lg"
						>
							<div>
								<span className="text-xs font-bold uppercase text-gray-400 border-gray-300 px-2 py-0.5 rounded">
									{post.type}
								</span>

								<p className="mt-2 text-gray-800">
									{post.content.substring(0, 100)}...
								</p>

								<div className="text-xs text-gray-400 mt-2">
									{new Date(
										post.created_at,
									).toLocaleDateString()}{" "}
									• Comment:{" "}
									{post.allow_comments ? "On" : "Off"}
								</div>
							</div>

							<button
								onClick={() => deletePost(post.id)}
								className="text-red-500 hover:text-red-700 text-sm font-medium px-3"
							>
								Delete
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
