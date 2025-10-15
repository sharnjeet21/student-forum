import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { createReply } from '../../services/replyService'
import toast from 'react-hot-toast'

interface ReplyFormProps {
  threadId: string
  onReplyAdded: () => void
  parentReplyId?: string
}

interface ReplyFormData {
  content: string
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ 
  threadId, 
  onReplyAdded, 
  parentReplyId 
}) => {
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReplyFormData>()

  const onSubmit = async (data: ReplyFormData) => {
    if (!currentUser) return

    setLoading(true)
    try {
      await createReply({
        threadId,
        content: data.content,
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        parentReplyId,
      })

      toast.success('Reply posted successfully!')
      reset()
      onReplyAdded()
    } catch (error: any) {
      toast.error(error.message || 'Failed to post reply')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="card text-center">
        <p className="text-gray-600 mb-4">Please log in to post a reply</p>
        <a href="/login" className="btn-primary">
          Log In
        </a>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {parentReplyId ? 'Reply to comment' : 'Your Answer'}
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <textarea
            {...register('content', { required: 'Reply content is required' })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Share your knowledge and help solve this problem..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Reply'}
          </button>
        </div>
      </form>
    </div>
  )
}