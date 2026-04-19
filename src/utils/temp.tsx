import { useEffect, useState } from 'react'
import supabase from '../supabaseCreatedClient'

interface Comment {
    id: string
    content: string
    user_id: string
    created_at: string
    profiles: { username: string } // We will join this data
}

interface Props {
    postId: string
    allowComments: boolean
}

export default function CommentSection({ postId, allowComments }: Props) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [userId, setUserId] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false) // Toggles the view

    useEffect(() => {
        // Get current user for permission checks
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
    }, [])

    // Fetch comments only when opened (to save data)
    const fetchComments = async () => {
        if (!isOpen) {
            setIsOpen(true)
            
            // JOIN query: Get comment + username of commenter
            const { data } = await supabase
                .from('comments')
                .select('*, profiles(username)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true })
            
            if (data) setComments(data as any)
        } else {
            setIsOpen(false)
        }
    }

    const handleSubmit = async () => {
        if (!newComment.trim()) return
        if (!userId) return alert("Please login to comment")

        const { error } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: userId,
            content: newComment
        })

        if (!error) {
            setNewComment('')
            // Refresh list
            const { data } = await supabase
                .from('comments')
                .select('*, profiles(username)')
                .eq('post_id', postId)
                .order('created_at', { ascending: true })
            if (data) setComments(data as any)
        }
    }

    return (
        <div className="mt-4">
            {/* Toggle Button */}
            <button 
                onClick={fetchComments}
                className="text-sm text-gray-500 hover:text-blue-600 font-medium"
            >
                {isOpen ? 'Hide Comments' : 'View Comments'}
            </button>

            {isOpen && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                    
                    {/* 1. The List */}
                    <div className="space-y-3 mb-4">
                        {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet.</p>}
                        
                        {comments.map(comment => (
                            <div key={comment.id} className="text-sm">
                                <span className="font-bold text-gray-700">@{comment.profiles?.username}: </span>
                                <span className="text-gray-600">{comment.content}</span>
                            </div>
                        ))}
                    </div>

                    {/* 2. The Input (Only if allowed) */}
                    {allowComments ? (
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
    )
}