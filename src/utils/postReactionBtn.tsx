import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { Heart, Comment01Icon  } from "@hugeicons/core-free-icons";

interface ButtonProps {
	type: string;
	label?: string;
	hugeIcon?: keyof typeof hugeIconsObj;
	myReaction: string | null;
	counts: Record<string, number>;
	onClicked: Function;
	setColor: {
		normal?: string;
		preOnPress?: string;
		postOnPress?: string;
		fill?: string;
	};
}

const hugeIconsObj = {
	heart: Heart,
	comment: Comment01Icon,
};

export function ReactionButton({
	type,
	label,
	hugeIcon,
	myReaction,
	counts,
	onClicked,
	setColor: { normal = "", preOnPress = "", postOnPress = "", fill = "" },
}: ButtonProps) {
	const baseClass =
		"font-bold px-3 py-4 min-w-20 rounded-sm gap-1 flex flex-row items-center justify-around text-sm transition-colors border border-ink-light/30 cursor-pointer";
	const isActive = myReaction === type;
	const Hicon: IconSvgElement | undefined = hugeIcon ? hugeIconsObj[hugeIcon] : undefined;

	return (
		<button
			onClick={() => onClicked()}
			// don't do $ {baseClass + normal} or you'll i'll need to always make sure there's space " " at end of baseClass
			className={`${baseClass} ${normal} ${isActive ? postOnPress : preOnPress}`}
		>
			{Hicon ? (
				<HugeiconsIcon icon={Hicon} className={`${isActive && fill}`}></HugeiconsIcon>
			) : (
				<span>{label}</span>
			)}
			<span>{counts[type] || 0}</span>
		</button>
	);
}
