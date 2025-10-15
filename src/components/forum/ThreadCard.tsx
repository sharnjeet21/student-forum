import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { Thread } from '../../types'
import clsx from 'clsx'

interface ThreadCardProps {
  thread: Thread
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { gradient: string; bg: string; text: string }> = {
      general: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700' },
      homework: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700' },
      programming: { gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-700' },
      math: { gradient: 'from-red-500 to-pink-500', bg: 'bg-red-50', text: 'text-red-700' },
      science: { gradient: 'from-orange-500 to-yellow-500', bg: 'bg-orange-50', text: 'text-orange-700' },
      literature: { gradient: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    }
    return styles[category] || { gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700' }
  }

  const categoryStyle = getCategoryStyle(thread.category)

  return (
    <div className="card card-hover animate-fade-in group">
      <div className="flex items-start space-x-3 lg:space-x-6">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-1 lg:space-y-2 flex-shrink-0">
          <button className="p-1 lg:p-2 hover:bg-blue-50 rounded-xl transition-colors duration-200 group/vote">
            <ArrowUpIcon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 group-hover/vote:text-blue-500" />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-bold text-sm lg:text-lg text-gray-700">{thread.upvotes - thread.downvotes}</span>
            <span className="text-xs text-gray-400 hidden lg:block">votes</span>
          </div>
          <button className="p-1 lg:p-2 hover:bg-red-50 rounded-xl transition-colors duration-200 group/vote">
            <ArrowDownIcon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 group-hover/vote:text-red-500" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-full',
                categoryStyle.bg,
                categoryStyle.text
              )}>
                {thread.category.charAt(0).toUpperCase() + thread.category.slice(1)}
              </span>
              {thread.isResolved && (
                <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Solved</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <span>{thread.replyCount}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <Link 
            to={`/thread/${thread.id}`}
            className="block group/link"
          >
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 group-hover/link:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
              {thread.title}
            </h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed line-clamp-2 lg:line-clamp-3 mb-3 lg:mb-4">
              {thread.content.substring(0, 150)}...
            </p>
          </Link>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {thread.tags.slice(0, 4).map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-150"
                >
                  #{tag}
                </span>
              ))}
              {thread.tags.length > 4 && (
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                  +{thread.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {thread.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{thread.authorName}</p>
                  <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(thread.createdAt))} ago</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <span>👁️</span>
                <span>24 views</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}