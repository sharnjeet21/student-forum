import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { castVote, getUserVote } from '../services/voteService'
import toast from 'react-hot-toast'

interface UseVotingProps {
  targetId: string
  targetType: 'thread' | 'reply'
  initialUpvotes: number
  initialDownvotes: number
}

export const useVoting = ({ targetId, targetType, initialUpvotes, initialDownvotes }: UseVotingProps) => {
  const { currentUser } = useAuth()
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [loading, setLoading] = useState(false)

  // Reset vote counts when props change
  useEffect(() => {
    setUpvotes(initialUpvotes)
    setDownvotes(initialDownvotes)
  }, [initialUpvotes, initialDownvotes])

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) {
      toast.error('Please log in to vote')
      return
    }

    if (loading) return

    setLoading(true)
    
    try {
      // Store original state for rollback
      const originalUpvotes = upvotes
      const originalDownvotes = downvotes
      
      // Simple increment - no toggle logic
      let newUpvotes = upvotes
      let newDownvotes = downvotes
      
      if (voteType === 'upvote') {
        newUpvotes++
      } else {
        newDownvotes++
      }
      
      // Apply optimistic updates
      setUpvotes(newUpvotes)
      setDownvotes(newDownvotes)
      
      // Make API call
      await castVote(currentUser.id, targetId, targetType, voteType)
      
      // Show success message
      toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}!`, { 
        duration: 2000,
        icon: voteType === 'upvote' ? '👍' : '👎'
      })
      
    } catch (error) {
      // Rollback optimistic updates on error
      setUpvotes(upvotes)
      setDownvotes(downvotes)
      
      toast.error('Failed to vote. Please try again.', { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  return {
    upvotes,
    downvotes,
    voteScore: upvotes - downvotes,
    loading,
    handleVote,
    canVote: !!currentUser
  }
}