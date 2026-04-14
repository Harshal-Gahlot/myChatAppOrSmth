import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseCreatedClient";
import { PostType } from "./globalTypes";
import PostReaction from "../components/postReaction";
import CommentSection from "../components/commentSection";

interface Post {
	id: string;
	content: string;
	type: PostType;
	metadata: any;
	created_at: string;
	allow_comments: boolean;
}

export default function PublicPage() {
	const { username, category } = useParams();
	// 'null' means "req sent, checking if user exist". 'false' means "username doesn't exist". 'true' means "user exist"
	const [exists, setExists] = useState<boolean | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);

	useEffect(() => {
		async function fetchPublicData() {
			// finding the User ID from the username
			const { data: userData, error: userError } = await supabase
				.from("profiles")
				.select("id")
				.eq("username", username)
				.single();

			if (userError || !userData) {
				if (userError) console.log(userError);
				setExists(false);
				return;
			}

			// fetching the above username's posts

			let query = supabase
				.from('posts')
				.select('*')
				.eq('user_id', userData.id)
				.eq('is_public', true)
				.order('created_at', {ascending:false})

			if (category) {
				query = query.eq('type', category)
			}
			
			const { data: postsData } = await query

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
		<div className="max-w-2xl mx-auto p-6">
			<header className="mb-12 text-center">
				<h1 className="text-4xl font-black text-gray-900 mb-2">
					@{username}
				</h1>
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
						key={post.id}
						className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-show"
					>
						<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
							{post.type.replace("_", " ")}
						</div>

						{/* Main text */}
						<p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
							{post.content}{" "}
						</p>

						{/* conditionally rendering quote source  */}
						{post.type === "quote" && post.metadata?.source && (
							<div className="mt-4 text-sm text-gray-500 font-serif italic">
								- {post.metadata.source}
							</div>
						)}

						{/* Reaction Bar */}
						<div className="border-t border-gray-100 mt-4 pt-2">
							<PostReaction postId={post.id} postType={post.type} />
							<CommentSection post_id={post.id} allow_comments={post.allow_comments} />
						</div>

						<div className="mt-4 text-xs text-gray-400">
							{new Date(post.created_at).toLocaleDateString()}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
