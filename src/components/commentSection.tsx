import { useEffect, useState } from "react";
import supabase from "../supabaseCreatedClient";

interface Comment {
	id: string;
	content: string;
	user_id: string;
	created_at: string;
	profiles: { username: string };
}

interface Props {
	post_id: string;
	allow_comments: boolean;
	post_owner_id: string;
}

export default function CommentSection({ post_id, allow_comments, post_owner_id }: Props) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [user_id, setUserId] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		supabase.auth
			.getUser()
			.then(({ data }) => setUserId(data.user?.id || null));
	}, []);

	const fetchComments = async () => {
		if (!isOpen) {
			setIsOpen(true);

			const { data, error } = await supabase
				.from("comments")
				.select("*, profiles(username)")
				.eq("post_id", post_id)
				.order("created_at", { ascending: true })

			if (error) {
				console.error("error fetching comments:", error.message)
			}

			if (data) setComments(data as any);
		} else {
			setIsOpen(false);
		}
	};

	const handleSubmit = async () => {
		if (!newComment.trim()) return;
		if (!user_id) return alert("please login to comment");

		const { error } = await supabase.from("comments").insert({
			post_id: post_id,
			user_id: user_id,
			content: newComment,
		});

		if (!error) {
			setNewComment("");

			const { data } = await supabase
				.from("comments")
				.select("*, profils(username)")
				.eq("post_id", post_id)
				.order("created_at", { ascending: true });
			if (data) setComments(data as any);
		}
	};

	const deleteComment = async (commentId:string) => {
		if (!window.confirm("delete this comment for real?")) return;

		const {error} = await supabase
			.from("comments")
			.delete()
			.eq("id", commentId)

		if (error) {
			alert("error deleting comment: " + error.message)
		} else {
			setComments((prevComments) => prevComments.filter((c) => c.id !== commentId))
		}
	}

	return (
		<div className="mt-4">
			<button
				onClick={fetchComments}
				className="text-sm text-gray-500 hover:text-blue-600 font-medium"
			>
				{isOpen ? "Hide comments" : "view comments"}
			</button>

			{isOpen && (
				<div className="mt-4 bg-gray-50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
					{/* 1. The List */}
					<div className="space-y-3 mb-4">
						{comments.length === 0 && (
							<p className="text-gray-400 text-sm">
								No comments yet.
							</p>
						)}

						{comments.map((comment) => (
							<div key={comment.id} className="text-sm">
								<div>
								<span className="font-bold text-gray-700">
									@{comment.profiles?.username}:{" "}
								</span>
								<span className="text-gray-600">
									{comment.content}
								</span>
								</div>
								
								{(user_id === comment.user_id || user_id === post_owner_id) && (
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
					{allow_comments ? (
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="Add a comment..."
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
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
			)}
		</div>
	);
}
