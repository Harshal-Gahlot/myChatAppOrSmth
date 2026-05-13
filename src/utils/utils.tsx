import { create } from "zustand";
import { Profile } from "./globalTypes";

export type ProfileStore = {
	profile: Profile | null;
	setProfile: (profile: Profile | null) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
	profile: null,
	setProfile: (profile: Profile | null) => set({ profile }),
}));
