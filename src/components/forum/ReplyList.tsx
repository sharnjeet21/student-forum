import { useQuery } from 'react-query'
import { getReplies } from '../../services/replyService'
import { ReplyCard } from './ReplyCard'

interface ReplyListProps {
  threadId: string
  refreshKey: number
}

export const ReplyList: React.FC<ReplyListProps> = ({ threadId, refreshKey }) => {
  const { data: replies = [], isLoading, error } = useQuery(
    ['replies', threadId, refreshKey],
    () => getReplies(threadId),
    {
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading replies: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  if (replies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No replies yet. Be the first to help!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyCard key={reply.id} reply={reply} />
      ))}
    </div>
  )
}