// valid post types:
export type PostType = "thought" | "hot_take" | "blog" | "rule" | "belief" | "quote";

interface evo {
	evolved_from?: string;
	reason?: string;
	evolved_at?: Date;
}

export interface Post {
	id: string;
	user_id: string;
	content: string;
	type: PostType;
	created_at: string;
	allow_comments: boolean;
	metadata: { 
		evo_history: [evo]
		source?: string;
	 };
}
