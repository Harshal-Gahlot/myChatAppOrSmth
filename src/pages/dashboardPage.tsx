import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseCreatedClient";
import { PostType, Post, Profile } from "../utils/globalTypes";
import { useProfileStore } from "../utils/utils";
import type { ProfileStore } from "../utils/utils";

export default function Dashboard() {
	const navigate = useNavigate();
	const profile = useProfileStore((state: ProfileStore) => state.profile);
	const setProfile = useProfileStore((state: ProfileStore) => state.setProfile);
	const [postType, setPostType] = useState<PostType>("thought");
	const [content, setContent] = useState("");
	const [source, setSource] = useState("");
	const [allowComments, setAllowComments] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [myPosts, setMyPosts] = useState<Post[]>([]);
	const [evolvingPostId, setEvolvingPostId] = useState<string | null>(null);
	const [evolvedContent, setEvolvedContent] = useState("");
	const [evolvReason, setEvolvReason] = useState("");
	const [editingPostId, setEditingPostId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");
	console.log('profile', profile)

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

			fetchMyPosts(user.id);
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

	async function submitEvolv(post: Post) {
		if (!evolvedContent.trim() || !evolvReason.trim()) {
			return alert("fill in both the new belief and reason");
		}

		const currentHistory = post.metadata?.evo_history || [];

		const historySnapshot = {
			evolved_from: post.content,
			reason: evolvReason,
			date: new Date().toISOString(),
		};

		const updatedMetadata = {
			...post.metadata,
			evo_history: [...currentHistory, historySnapshot],
		};

		const { error } = await supabase
			.from("posts")
			.update({
				content: evolvedContent,
				metadata: updatedMetadata,
			})
			.eq("id", post.id);

		if (error) {
			alert("error:" + error.message);
		} else {
			setEvolvingPostId(null);
			setEvolvedContent("");
			setEvolvReason("");
			fetchMyPosts((await supabase.auth.getUser()).data.user!.id);
		}
	}

	async function submitEdit(postId: string) {
		if (!editContent.trim()) {
			return alert("nahh, edited post can't be empty nigga");
		}
		const { error } = await supabase
			.from("posts")
			.update({ content: editContent })
			.eq("id", postId);

		if (error) {
			alert("Error updating the post: " + error);
		} else {
			setEditingPostId(null);
			setEditContent("");
			fetchMyPosts((await supabase.auth.getUser()).data.user!.id);
		}
	}

	if (!profile) return <h1>Loading</h1>;

	return (
		<div className="max-w-2xl mx-auto p-8">
			{/* Header section */}
			{/* prettier-ignore */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="py-4 text-3xl">Studio ({profile.username})</h1>

				<button
					onClick={() => navigate(`/${profile.username}`)}
					className="text-blue-600"
				>
					View Public Page →
				</button>
			</div>

			{/* prettier-ignore */}
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

			{/* prettier-ignore */}
			<div className="mt-10">
				<h3 className="text-xl font-bold mb-4"> Your Archive</h3>

				<div className="space-y-4">
					{myPosts.length === 0 && (
						<p className="text-gray-400">You haven't created any posts</p>
					)}

					{myPosts.map((post) => (
						<div
							key={post.id}
							className="flex justify-between items-start bg-gray-50 border border-gray-200 p-4 rounded-lg">
							<div>
								<span className="text-xs font-bold uppercase text-gray-400 border-gray-300 py-0.5 rounded">
									{post.type}
								</span>

								{evolvingPostId === post.id ? (
									<div className="mt-3 space-y-2 bg-white p-3 border border-blue-200 rounded">
										<p className="text-sm text-gray-500 line-through mb-2">
											{post.content}
										</p>

										<input
											type="text"
											placeholder="your new belief"
											className="w-full border p-2 rounded text-sm outline-none"
											value={evolvedContent}
											onChange={ (e) => setEvolvedContent(e.target.value) }
										/>

										<input
											type="text"
											placeholder="why did you change your mind?"
											className="w-full border p-2 rounded text-sm bg-gray-50 outline-none"
											value={evolvReason}
											onChange={ (e) => setEvolvReason(e.target.value) }
										/>

										<div>
											<button
												onClick={() => submitEvolv(post)}
												className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
											>
												save evolution
											</button>
											<button
												onClick={() => setEvolvingPostId(null)}
												className="text-gray-500 px-3 py-1 text-sm hover:text-gray-700"
											>
												cancel
											</button>
										</div>
									</div>
								) : editingPostId === post.id ? (
									<div className="mt-3 space-y-2 bg-white p-3 border border-yellow-200 rounded">
										<textarea
											className="w-full border p-2 rounded text-sm outline-none resize-y"
											rows={3}
											value={editContent}
											onChange={(e) => setEditContent(e.target.value)}
										/>
										<div className="flex gap-2 mt-2">
											<button
												onClick={() => submitEdit(post.id)}	
												className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
											>
												save
											</button>
											<button
												onClick={() => setEditingPostId(null)}
												className="text-gray-500 px-3 py-1 text-sm hover:text-gray-700"
											>
												cancel
											</button>
										</div>
									</div>
								) : (
									<div className="mt-2">
										{post.metadata.evo_history?.length > 0 && (
											<div className="space-y-3 mb-3 border-l-2 border-blue-200 pl-3">
												{post.metadata.evo_history.map((
														history_item: any,
														index: number,
													) => (
														<div
															key={index}
															className="text-sm">
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
										)}
									</div>
								)}

								<h2> {post.content.substring(0, 100) + (post.content.length > 100 ? "..." : "")} </h2>

								<div className="text-xs text-gray-400 mt-2">
									{new Date( post.created_at).toLocaleDateString() + 
									" • Comment: " +
									(post.allow_comments ? "On" : "Off")}
								</div>
							</div>

							<div className="flex flex-col gap-2 items-end">
								{post.type === "belief" &&
									evolvingPostId !== post.id && (
										<button
											className="text-blue-500 hover:text-blue-700 text-sm font-medium px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
											onClick={() => {
												setEvolvingPostId(post.id);
												setEvolvedContent("");
												setEvolvReason("");
											}}
										>
											Evolve
										</button>
								)}

								{post.type !== "belief" && editingPostId != post.id && (
									<button
										className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-3 py-1 border border-yellow-200 rounded hover:bg-yellow-50 cursor-pointer"
										onClick={() => {
											setEditingPostId(post.id);
											setEditContent(post.content);
										}}
									>
										Edit
									</button>
								)}

								<button
									onClick={() => deletePost(post.id)}
									className="text-red-500 hover:text-red-700 text-sm font-medium px-3"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
