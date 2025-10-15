import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { useVoting } from '../../hooks/useVoting'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface VoteButtonsProps {
  targetId: string
  targetType: 'thread' | 'reply'
  upvotes: number
  downvotes: number
  userVote?: 'upvote' | 'downvote' | null
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  targetId,
  targetType,
  upvotes,
  downvotes,
  userVote = null
}) => {
  const {
    upvotes: currentUpvotes,
    downvotes: currentDownvotes,
    voteScore,
    loading,
    handleVote,
    canVote
  } = useVoting({
    targetId,
    targetType,
    initialUpvotes: upvotes,
    initialDownvotes: downvotes
  })

  const onVote = (voteType: 'upvote' | 'downvote') => {
    if (!canVote) {
      toast.error('Please log in to vote')
      return
    }
    handleVote(voteType)
  }

  return (
    <div className="flex flex-col items-center space-y-2 text-sm bg-gray-50 rounded-lg p-2">
      <button
        onClick={() => onVote('upvote')}
        disabled={loading || !canVote}
        className={clsx(
          'p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:text-green-600 hover:bg-green-50',
          'text-gray-400',
          (!canVote || loading) && 'opacity-50 cursor-not-allowed'
        )}
        title={canVote ? 'Upvote' : 'Login to vote'}
      >
        <ArrowUpIcon className={clsx(
          'h-5 w-5 transition-transform',
          loading && 'animate-pulse'
        )} />
      </button>
      
      <div className="text-center py-1">
        <div className={clsx(
          'font-bold text-lg',
          voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-500'
        )}>
          {voteScore > 0 ? '+' : ''}{voteScore}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {currentUpvotes}↑ {currentDownvotes}↓
        </div>
      </div>
      
      <button
        onClick={() => onVote('downvote')}
        disabled={loading || !canVote}
        className={clsx(
          'p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:text-red-600 hover:bg-red-50',
          'text-gray-400',
          (!canVote || loading) && 'opacity-50 cursor-not-allowed'
        )}
        title={canVote ? 'Downvote' : 'Login to vote'}
      >
        <ArrowDownIcon className={clsx(
          'h-5 w-5 transition-transform',
          loading && 'animate-pulse'
        )} />
      </button>
    </div>
  )
}