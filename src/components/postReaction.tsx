import { useEffect, useState } from "react";
import supabase from "../supabaseCreatedClient";
import { ReactionButton } from "../pages/utils";

interface Props {
	postId: string;
	postType: string;
}

export default function PostReaction({ postId, postType }: Props) {
	const [userId, setUserId] = useState<string | null>(null);
	const [myReaction, setMyReaction] = useState<string | null>(null);
	const [counts, setCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		async function fetchData() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUserId(user?.id || null);

			const { data } = await supabase
				.from("reactions")
				.select("type, user_id")
				.eq("post_id", postId);

			if (data) {
				const newCounts: Record<string, number> = {};
				data.forEach((r) => {
					newCounts[r.type] = (newCounts[r.type] || 0) + 1;
				});
				setCounts(newCounts);

				if (user) {
					const myRxn = data.find((r) => r.user_id === user.id);
					if (myRxn) setMyReaction(myRxn.type);
				}
			}
		}
		fetchData();
	}, [postId]);

	const handleReact = async (type: string) => {
		if (!userId) return alert("please login to react");

		const previousReaction = myReaction;
		const previousCounts = { ...counts };

		if (myReaction === type) {
			setMyReaction(null);
			setCounts((prev) => ({
				...prev,
				[type]: Math.max(0, (prev[type] || 0) - 1),
			}));

			await supabase
				.from("reactions")
				.delete()
				.eq("post_id", postId)
				.eq("user_id", userId);
		} else {
			setMyReaction(type);
			setCounts((prev) => ({
				...prev,
				[type]: (prev[type] || 0) + 1,
				...(previousReaction
					? {
							[previousReaction]:
								Math.max(0, prev[previousReaction] || 0) - 1,
						}
					: {}),
			}));

			if (previousReaction) {
				await supabase
					.from("reactions")
					.delete()
					.eq("post_id", postId)
					.eq("user_id", userId);
			}

			await supabase.from("reactions").insert({
				post_id: postId,
				user_id: userId,
				type: type,
			});
		}
	};

	// Rendering return

	if (postType === "hot_take") {
		return (
			<div className="flex gap-4 mt-3">
				<ReactionButton
					type="plus_one"
					label="+1"
					activeColor="bg-green-100 text-green-700"
					myReaction={myReaction}
					counts={counts}
					onReact={handleReact}
				/>

				<ReactionButton
					type="trash"
					label="🗑️ Trash"
					activeColor="bg-red-100 text-red-700"
					myReaction={myReaction}
					counts={counts}
					onReact={handleReact}
				/>

			</div>
		);
	}

	return (
		<div className="mt-3">
			<ReactionButton
					type="like"
					label={myReaction === 'like' ? '❤️' : '🤍'}
					activeColor="bg-pink-100 text-pink-700"
					myReaction={myReaction}
					counts={counts}
					onReact={handleReact}
			/>
		</div>
	);
}
