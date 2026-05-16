import { create } from "zustand";
import { Profile, Post } from "./globalTypes";

// ---- Generic rendering component if the page data hasn't loaded up, for any given reason.
type CommonPostPageState = { status: "loading" } | { status: "404" } | { status: "error" };

export type PostPageState = CommonPostPageState | { status: "loaded"; post: Post };
export type PostsPageState = CommonPostPageState | { status: "loaded"; posts: Post[] };

export function managePageStateRendring(
	status: "loading" | "404" | "error",
	errorMessage?: string,
) {
	switch (status) {
		case "loading":
			return <p>im Loading very fost fost! </p>;
		case "404":
			if (errorMessage) return <p>{errorMessage}</p>;
			else return <p>this url doesn't exist</p>;
		case "error":
			if (errorMessage) return <p>{errorMessage}</p>;
			else return <p>error while loading page</p>;
	}
}

// ---- store username of user
export interface ProfileStore {
	profile: Profile | null;
	setProfile: (profile: Profile | null) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
	profile: null,
	setProfile: (profile: Profile | null) => set({ profile }),
}));

// ---- Cache post data and from_page, so as to load previous page fast and from where user left.
interface CacheBucket {
	posts: Post[];
	hasLoadedBefore: Boolean;
}

interface MultiPagePostState {
	// maps key and caches like:  { "/feed": { posts: [...], hasLoadedBefore: true } }
	cachesPosts: Record<string, CacheBucket>;
	scrollPositions: Record<string, number>;
	// Actions
	setCachePosts: (routeKey: string, Posts: Post[]) => void;
	setPageScroll: (routeKey: string, y: number) => void;
	clearAllCaches: () => void;
}

export const usePostStore = create<MultiPagePostState>((set) => ({
	cachesPosts: {},
	scrollPositions: {},

	setCachePosts: (routeKey, posts) =>
		set((state) => ({
			cachesPosts: {
				...state.cachesPosts,
				[routeKey]: { posts, hasLoadedBefore: true },
			},
		})),

	setPageScroll: (routeKey, y) =>
		set((state) => ({
			scrollPositions: { ...state.scrollPositions, [routeKey]: y },
		})),

	clearAllCaches: () => set({ cachesPosts: {}, scrollPositions: {} }),
}));
