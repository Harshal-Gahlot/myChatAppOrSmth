import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { Heart } from "@hugeicons/core-free-icons";

interface ButtonProps {
	type: string;
	label?: string;
	hugeIcon?: keyof typeof hugeIconsObj;
	myReaction: string | null;
	counts: Record<string, number>;
	onReact: (type: string) => void;
	setColor: {
		normal?: string;
		preOnPress?: string;
		postOnPress?: string;
		fill?: string;
	};
}

const hugeIconsObj = {
	heart: Heart,
};

// 	<button className="font-heading
// 	">
// </button>

export function ReactionButton({
	type,
	label,
	hugeIcon,
	myReaction,
	counts,
	onReact,
	setColor: { normal = "", preOnPress = "", postOnPress = "", fill = "" },
}: ButtonProps) {
	const baseClass =
		"flex flex-row items-center justify-around gap-1 text-sm font-bold px-3 py-4 min-w-20 rounded-sm transition-colors border border-ink-light/30 cursor-pointer ";
	const isActive = myReaction === type;
	const Hicon: IconSvgElement | undefined = hugeIcon ? hugeIconsObj[hugeIcon] : undefined;

	return (
		<button
			onClick={() => onReact(type)}
			className={`${baseClass + normal} ${isActive ? postOnPress : preOnPress}`}
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
