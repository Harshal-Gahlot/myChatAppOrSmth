interface ButtonProps {
    type: string
    label: string
    myReaction: string | null
    counts: Record<string, number>
    onReact: (type: string) => void
    activeColor: string
}

export function ReactionButton({type, label, myReaction, counts, onReact, activeColor}: ButtonProps) {
    const baseClass = "flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full transition-colors";
    const isActive = myReaction === type
    
	return (
		<button
			onClick={() => onReact(type)}
			className={`${baseClass} ${isActive ? activeColor : "text-gray-500 hover:bg-gray-100"}`}
		>
			<span>{label}</span>
			<span>{counts[type] || 0}</span>
		</button>
	);
}