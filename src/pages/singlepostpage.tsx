import PostReaction from "@/components/postReaction";
import supabase from "@/supabaseCreatedClient";
import { Post } from "@/utils/globalTypes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface Comment {
	id: string;
	content: string;
	user_id: string;
	created_at: string;
	profiles: { username: string };
}

export default function SinglePostPage() {
	const { post_id } = useParams();
	const [user_id, setUser_id] = useState<string | null>(null);
	const [post, setPost] = useState<Post | null>(null);
	const [showOldBeliefs, setShowOldBeliefs] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentsStatus, setCommentsStatus] = useState<string>("Loading...");
	const [writtenComment, setWrittenComment] = useState<string>("");

	useEffect(() => {
		async function fetchSinglePost() {
			const { data: userData } = await supabase.auth.getUser();
			setUser_id(userData.user?.id || null);

			const { data, error } = await supabase
				.from("posts")
				.select("*, profiles(id)")
				.eq("id", post_id)
				.single();

			if (error) {
				console.log("error while fetching single post", error);
				return;
			}

			setPost(data as Post);

			if (!data.allow_comments) {
				setCommentsStatus("Comments are off");
			} else {
				const { data: commentsData, error: commentsError } = await supabase
					.from("comments")
					.select("*")
					.eq("post_id", post_id)
					.order("created_at", { ascending: true });

				if (commentsError) {
					console.log("error while fetching comments", error);
					setCommentsStatus("error while loading comments");
					return;
				}

				setComments(commentsData);
			}
		}

		fetchSinglePost();
	}, [post_id]);

	async function handleSubmit() {
		if (!writtenComment) return;
		if (!user_id) return alert("pls log in to comment");

		const { error } = await supabase.from("comments").insert({
			post_id: post_id,
			user_id: user_id,
			content: writtenComment,
		});

		if (!error) {
			setWrittenComment("");

			const { data } = await supabase
				.from("comments")
				.select("*")
				.eq("post_id", post_id)
				.order("created_at", { ascending: true });
			if (data) setComments(data as Comment[]);
		}
	}

	async function deleteComment(commentId: string) {
		if (!window.confirm("delete it for real?")) return;

		const { error } = await supabase.from("comments").delete().eq("id", commentId);

		if (error) alert("error deleting this comment: " + error.message);
		else setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
	}

	if (!post) {
		return <p>loading...</p>;
	}

	return (
		<div
			key={post.id}
			className="relative p-6 mb-8 border border-ink-light/40 bg-parchment-light rounded-sm" // shadow-sm hover:shadow-md transition-show"
		>
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
					{post.type === "belief" && post.metadata?.evo_history?.length > 1 && (
						<button
							className="px-4 py-2 text-sm rounded-sm tracking-wide font-bold text-ink bg-parchment-dark mb-4 
											border-3 border-parchment-outline shadow-ink inset-shadow-sm/50 hover:cursor-pointer
											hover:bg-parchment-darker" // hover:inset-shadow-sm/0 hover:shadow-sm"
							onClick={() => setShowOldBeliefs(!showOldBeliefs)}
						>
							{showOldBeliefs ? (
								"hide old beliefs"
							) : (
								<div>View previous +{post.metadata?.evo_history?.length - 1}</div>
							)}
						</button>
					)}

					{showOldBeliefs ? (
						<div>
							{post.metadata.evo_history.map((history_item: any, index: number) => (
								<div key={index} className="text-sm">
									<p className="text-gray-400 line-through decoration-red-300">
										{history_item.evolved_from}
									</p>
									<p className="text-xs text-blue-500 font-medium mt-1">
										<span className="italic"> Reason:</span>
										{" " + history_item.reason}
									</p>
								</div>
							))}
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
			<p className="text-lg whitespace-pre-wrap leading-relaxed text-ink">{post.content} </p>
			{/* conditionally rendering quote source  */}
			{post.type === "quote" && post.metadata?.source && (
				<div className="mt-4 text-sm text-gray-500 font-serif italic">
					- {post.metadata.source}
				</div>
			)}
			{/* Reaction Bar */}
			<div className="flex flex-col gap-0 border-t border-gray-100 mt-4 pt-2">
				<PostReaction postId={post.id} postType={post.type} />
			</div>
			{comments ? (
				<div className="mt-4 bg-gray-50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
					{/* 1. The List */}
					<div className="space-y-3 mb-4">
						{comments.length === 0 && (
							<p className="text-gray-400 text-sm">No comments yet.</p>
						)}

						{comments.map((comment) => (
							<div key={comment.id} className="text-sm">
								<div>
									<span className="font-bold text-gray-700">
										@{comment.profiles?.username}:{" "}
									</span>
									<span className="text-gray-600">{comment.content}</span>
								</div>

								{(user_id === comment.user_id || user_id === post.profiles.id) && (
									<button
										onClick={() => deleteComment(comment.id)}
										className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
									>
										Delete
									</button>
								)}
							</div>
						))}
					</div>

					{/* 2. The Input (Only if allowed) */}
					{post.allow_comments ? (
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="Add a comment..."
								value={writtenComment}
								onChange={(e) => setWrittenComment(e.target.value)}
								className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
							/>
							<button
								onClick={handleSubmit}
								className="bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700"
							>
								Send
							</button>
						</div>
					) : (
						<div className="text-xs text-red-400 italic border-t border-gray-200 pt-2">
							Comments are turned off for this post.
						</div>
					)}
				</div>
			) : (
				<div>{commentsStatus}</div>
			)}
		</div>
	);
}
