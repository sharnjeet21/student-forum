import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline'
import { Thread } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { VoteButtons } from './VoteButtons'
import { AttachmentList } from './AttachmentList'
import clsx from 'clsx'

interface ThreadDetailProps {
  thread: Thread
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({ thread }) => {
  const { currentUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      homework: 'bg-green-100 text-green-800',
      programming: 'bg-purple-100 text-purple-800',
      math: 'bg-red-100 text-red-800',
      science: 'bg-yellow-100 text-yellow-800',
      literature: 'bg-indigo-100 text-indigo-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const canEdit = currentUser && (currentUser.id === thread.authorId || currentUser.isAdmin)

  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        <VoteButtons 
          targetId={thread.id}
          targetType="thread"
          upvotes={thread.upvotes}
          downvotes={thread.downvotes}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={clsx('px-3 py-1 text-sm font-medium rounded-full', getCategoryColor(thread.category))}>
                {thread.category}
              </span>
              {thread.isResolved && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Resolved</span>
                </div>
              )}
            </div>
            
            {canEdit && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {thread.title}
          </h1>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {thread.content}
            </p>
          </div>

          {/* Attachments */}
          {thread.attachments && thread.attachments.length > 0 && (
            <AttachmentList attachments={thread.attachments} />
          )}

          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {thread.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span>Asked by <strong>{thread.authorName}</strong></span>
              <span>{formatDistanceToNow(thread.createdAt)} ago</span>
              {thread.updatedAt > thread.createdAt && (
                <span>• Updated {formatDistanceToNow(thread.updatedAt)} ago</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}