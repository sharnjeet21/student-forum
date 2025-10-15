import { Thread, Reply } from '../../types'
import { 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftIcon, 
  StarIcon,
  TrophyIcon,
  FireIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface UserStatsProps {
  threads: Thread[]
  replies: Reply[]
  reputation: number
}

export const UserStats: React.FC<UserStatsProps> = ({ threads, replies, reputation }) => {
  const resolvedThreads = threads.filter(thread => thread.isResolved).length
  const acceptedReplies = replies.filter(reply => reply.isAccepted).length
  const totalVotes = threads.reduce((sum, thread) => sum + thread.upvotes - thread.downvotes, 0) +
                    replies.reduce((sum, reply) => sum + reply.upvotes - reply.downvotes, 0)

  const stats = [
    {
      name: 'Questions Asked',
      value: threads.length,
      icon: QuestionMarkCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Total questions posted'
    },
    {
      name: 'Answers Given',
      value: replies.length,
      icon: ChatBubbleLeftIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total answers provided'
    },
    {
      name: 'Reputation Points',
      value: reputation,
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Community recognition'
    },
    {
      name: 'Problems Solved',
      value: resolvedThreads,
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Questions marked as resolved'
    },
    {
      name: 'Accepted Answers',
      value: acceptedReplies,
      icon: TrophyIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Answers marked as best'
    },
    {
      name: 'Total Votes',
      value: totalVotes,
      icon: FireIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Net upvotes received'
    }
  ]

  const getReputationLevel = (rep: number) => {
    if (rep >= 1000) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (rep >= 500) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (rep >= 100) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' }
    return { level: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  const reputationLevel = getReputationLevel(reputation)

  return (
    <div className="space-y-6">
      {/* Reputation Level Badge */}
      <div className="card text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`w-12 h-12 ${reputationLevel.bg} rounded-full flex items-center justify-center`}>
            <StarIcon className={`h-6 w-6 ${reputationLevel.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Community Level</h3>
            <span className={`text-sm font-semibold ${reputationLevel.color}`}>
              {reputationLevel.level}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((reputation / 1000) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {reputation < 1000 ? `${1000 - reputation} points to Expert level` : 'Maximum level reached!'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card text-center hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-700 mb-1">{stat.name}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </div>
          )
        })}
      </div>

      {/* Activity Summary */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Questions with accepted answers</span>
            <span className="font-semibold text-gray-900">
              {resolvedThreads} / {threads.length}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Answer acceptance rate</span>
            <span className="font-semibold text-gray-900">
              {replies.length > 0 ? Math.round((acceptedReplies / replies.length) * 100) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Average votes per post</span>
            <span className="font-semibold text-gray-900">
              {threads.length + replies.length > 0 
                ? (totalVotes / (threads.length + replies.length)).toFixed(1)
                : '0.0'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}