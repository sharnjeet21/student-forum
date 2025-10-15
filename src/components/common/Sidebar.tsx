import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  CodeBracketIcon,
  BeakerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { getForumStats } from '../../services/statsService'
import clsx from 'clsx'

const categoriesConfig = [
  {
    id: 'general',
    name: 'General Discussion',
    icon: HomeIcon,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'homework',
    name: 'Homework Help',
    icon: QuestionMarkCircleIcon,
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50'
  },
  {
    id: 'programming',
    name: 'Programming',
    icon: CodeBracketIcon,
    gradient: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'math',
    name: 'Mathematics',
    icon: BeakerIcon,
    gradient: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50'
  },
  {
    id: 'science',
    name: 'Science',
    icon: AcademicCapIcon,
    gradient: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'literature',
    name: 'Literature',
    icon: BookOpenIcon,
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50'
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  // Fetch forum statistics
  const { data: stats, isLoading } = useQuery(
    'forumStats',
    getForumStats,
    {
      refetchInterval: 60000, // Refresh every minute
      refetchOnWindowFocus: false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Keep in cache for 5 minutes
    }
  )





  // Combine category config with real counts
  const categories = categoriesConfig.map(category => ({
    ...category,
    count: stats?.categoryStats[category.id] || 0
  }))

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-80 bg-white/95 backdrop-blur-md border-r border-white/20 h-full
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Explore Topics</h2>
            <p className="text-sm text-gray-600">Find discussions that interest you</p>
          </div>

          <nav className="space-y-3">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = location.pathname === `/category/${category.id}`

              return (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  onClick={onClose}
                  className={clsx(
                    'group flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]',
                    isActive
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                      : `${category.bgColor} hover:shadow-md border border-white/50`
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={clsx(
                      'p-2 rounded-xl',
                      isActive
                        ? 'bg-white/20'
                        : `bg-gradient-to-r ${category.gradient}`
                    )}>
                      <Icon className={clsx(
                        'h-5 w-5',
                        isActive ? 'text-white' : 'text-white'
                      )} />
                    </div>
                    <div>
                      <h3 className={clsx(
                        'font-semibold text-sm',
                        isActive ? 'text-white' : 'text-gray-900'
                      )}>
                        {category.name}
                      </h3>
                      <p className={clsx(
                        'text-xs',
                        isActive ? 'text-white/80' : 'text-gray-500'
                      )}>
                        {isLoading ? '...' : category.count} discussion{category.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className={clsx(
                    'text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-600'
                  )}>
                    {isLoading ? '...' : category.count}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* AI Assistant Section */}
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="mr-2 animate-bounce">🤖</span>
                AI Study Assistant
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Get instant help with your questions! Our AI assistant can provide explanations, examples, and follow-up questions.
            </p>
            <div className="space-y-2">
              <div className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded-lg flex items-center">
                <span className="mr-2">💡</span>
                Look for the "Ask AI Assistant" button on any question
              </div>
              <div className="text-xs text-green-600 bg-green-100 px-3 py-2 rounded-lg flex items-center">
                <span className="mr-2 animate-pulse">⚡</span>
                Average response time: 5-8 seconds
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-white/50">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-pulse"></span>
                Forum Stats
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">📝</span>
                  </div>
                  <span className="text-sm text-gray-600">Total Questions</span>
                </div>
                <span className="font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalThreads.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">👥</span>
                  </div>
                  <span className="text-sm text-gray-600">Total Users</span>
                </div>
                <span className="font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalUsers.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">💬</span>
                  </div>
                  <span className="text-sm text-gray-600">Total Answers</span>
                </div>
                <span className="font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalReplies.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">✅</span>
                  </div>
                  <span className="text-sm text-gray-600">Solved Today</span>
                </div>
                <span className="font-bold text-green-600">
                  {isLoading ? '...' : stats?.solvedToday.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}