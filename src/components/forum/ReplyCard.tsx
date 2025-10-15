import { formatDistanceToNow } from 'date-fns'
import { CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Reply } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { VoteButtons } from './VoteButtons'
import clsx from 'clsx'

interface ReplyCardProps {
  reply: Reply
}

export const ReplyCard: React.FC<ReplyCardProps> = ({ reply }) => {
  const { currentUser } = useAuth()
  
  const canEdit = currentUser && (currentUser.id === reply.authorId || currentUser.isAdmin)

  return (
    <div className={clsx(
      'card',
      reply.isAccepted && 'border-green-200 bg-green-50',
      reply.isAIGenerated && 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
    )}>
      <div className="flex items-start space-x-4">
        <VoteButtons 
          targetId={reply.id}
          targetType="reply"
          upvotes={reply.upvotes}
          downvotes={reply.downvotes}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 flex items-center">
                {reply.isAIGenerated && <span className="mr-2">🤖</span>}
                {reply.authorName}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(reply.createdAt)} ago
              </span>
              {reply.isAIGenerated && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <span className="text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">
                    AI Assistant
                  </span>
                  {reply.aiConfidence && (
                    <span className="text-xs text-blue-500">
                      {Math.round(reply.aiConfidence * 100)}% confidence
                    </span>
                  )}
                </div>
              )}
              {reply.isAccepted && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Accepted Answer</span>
                </div>
              )}
            </div>
            
            {canEdit && (
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {reply.content}
            </p>
          </div>

          {/* AI Follow-up Questions */}
          {reply.isAIGenerated && reply.followUpQuestions && reply.followUpQuestions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Related Questions to Explore:
              </h4>
              <ul className="space-y-1">
                {reply.followUpQuestions.map((question, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="mr-2 text-blue-400">•</span>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reply.updatedAt > reply.createdAt && (
            <p className="text-xs text-gray-500 mt-2">
              Edited {formatDistanceToNow(reply.updatedAt)} ago
            </p>
          )}
        </div>
      </div>
    </div>
  )
}