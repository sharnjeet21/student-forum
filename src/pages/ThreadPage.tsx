import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getThread } from '../services/threadService'
import { ThreadDetail } from '../components/forum/ThreadDetail'
import { ReplyList } from '../components/forum/ReplyList'
import { ReplyForm } from '../components/forum/ReplyForm'
import { AIReplyLoading } from '../components/forum/AIReplyLoading'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const ThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [isAIGenerating, setIsAIGenerating] = useState(false)

  const { data: thread, isLoading, error } = useQuery(
    ['thread', id, refreshKey],
    () => getThread(id!),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  )

  const handleReplyAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Thread not found or failed to load.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ThreadDetail thread={thread} />
      
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Replies ({thread.replyCount})
          </h2>
          <div>
            {/* AI Reply Button - Available to all users */}
            <button
              onClick={async () => {
                if (isAIGenerating) return
                
                setIsAIGenerating(true)
                
                try {
                  toast.success('🤖 AI Assistant is analyzing your question...', {
                    duration: 2000,
                    icon: '🤖'
                  })
                  
                  const { generateAIReply } = await import('../services/aiReplyService')
                  await generateAIReply(thread)
                  
                  toast.success('✅ AI reply generated successfully!', {
                    duration: 3000,
                    icon: '✨'
                  })
                  
                  // Refresh replies after AI response
                  setTimeout(() => {
                    setRefreshKey(prev => prev + 1)
                    setIsAIGenerating(false)
                  }, 1000)
                } catch (error) {
                  toast.error('❌ Failed to generate AI reply. Please try again.', {
                    duration: 4000
                  })
                  setIsAIGenerating(false)
                }
              }}
              disabled={isAIGenerating}
              className={`text-sm px-3 py-1 rounded-lg flex items-center space-x-1 transition-all duration-200 ${
                isAIGenerating
                  ? 'bg-blue-200 text-blue-600 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
              }`}
            >
              <span className={isAIGenerating ? 'animate-spin' : ''}>
                {isAIGenerating ? '⏳' : '🤖'}
              </span>
              <span>
                {isAIGenerating ? 'AI Thinking...' : 'Ask AI Assistant'}
              </span>
            </button>
            

          </div>
        </div>
        
        {/* Show AI Loading Animation */}
        {isAIGenerating && (
          <AIReplyLoading 
            onCancel={() => {
              setIsAIGenerating(false)
              toast.error('AI reply generation cancelled', { duration: 2000 })
            }}
          />
        )}
        
        <ReplyList threadId={thread.id} refreshKey={refreshKey} />
        
        {currentUser && (
          <div className="mt-6">
            <ReplyForm threadId={thread.id} onReplyAdded={handleReplyAdded} />
          </div>
        )}
      </div>
    </div>
  )
}