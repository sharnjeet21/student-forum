import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { getUserThreads, getUserReplies } from '../services/userService'
import { ThreadCard } from '../components/forum/ThreadCard'
import { ProfileSettings } from '../components/profile/ProfileSettings'
import { PasswordChange } from '../components/profile/PasswordChange'
import { UserStats } from '../components/profile/UserStats'
import { ProfileDebug } from '../components/debug/ProfileDebug'
import { formatDistanceToNow } from 'date-fns'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/settings')) return 'settings'
    if (location.pathname.includes('/security')) return 'security'
    return 'overview'
  }
  
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security'>(getActiveTabFromPath())

  const refreshProfileData = () => {
    queryClient.invalidateQueries(['userThreads', currentUser?.id])
    queryClient.invalidateQueries(['userReplies', currentUser?.id])
  }

  useEffect(() => {
    setActiveTab(getActiveTabFromPath())
  }, [location.pathname])

  const handleTabChange = (tab: 'overview' | 'settings' | 'security') => {
    setActiveTab(tab)
    const path = tab === 'overview' ? '/profile' : `/profile/${tab}`
    navigate(path)
  }

  const { data: userThreads = [], isLoading: threadsLoading, error: threadsError } = useQuery(
    ['userThreads', currentUser?.id],
    () => getUserThreads(currentUser!.id),
    {
      enabled: !!currentUser,
      refetchOnWindowFocus: false,
    }
  )

  const { data: userReplies = [], isLoading: repliesLoading, error: repliesError } = useQuery(
    ['userReplies', currentUser?.id],
    () => getUserReplies(currentUser!.id),
    {
      enabled: !!currentUser,
      refetchOnWindowFocus: false,
    }
  )

  // Debug logging
  console.log('👤 Profile data:', {
    currentUser: currentUser?.id,
    userThreads: userThreads.length,
    userReplies: userReplies.length,
    threadsLoading,
    repliesLoading,
    threadsError,
    repliesError
  })

  if (!currentUser) return null

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: Cog6ToothIcon },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <h1 className="text-4xl font-bold gradient-text">My Profile</h1>
          <button
            onClick={refreshProfileData}
            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="Refresh profile data"
          >
            🔄
          </button>
        </div>
        <p className="text-gray-600">Manage your account and track your activity</p>
      </div>

      {/* Profile Header Card */}
      <div className="card">
        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            {currentUser.isAdmin && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                ADMIN
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{currentUser.displayName}</h2>
            <p className="text-base lg:text-lg text-gray-600 mb-2">{currentUser.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 lg:gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                📅 Joined {formatDistanceToNow(currentUser.createdAt)} ago
              </span>
              <span className="flex items-center">
                ⭐ {currentUser.reputation} reputation points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={clsx(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <UserStats 
            threads={userThreads} 
            replies={userReplies} 
            reputation={currentUser.reputation} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Questions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-blue-500" />
                  Recent Questions
                </h3>
                <span className="text-sm text-gray-500">{userThreads.length} total</span>
              </div>
              
              {threadsLoading ? (
                <div className="card text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your questions...</p>
                </div>
              ) : userThreads.length === 0 ? (
                <div className="card text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QuestionMarkCircleIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-gray-500 mb-4">You haven't asked any questions yet.</p>
                  <a href="/create-thread" className="btn-primary">Ask Your First Question</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {userThreads.slice(0, 3).map((thread) => (
                    <div key={thread.id} className="card hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{thread.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{thread.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{thread.replyCount} replies</span>
                        <span>{formatDistanceToNow(thread.createdAt)} ago</span>
                      </div>
                    </div>
                  ))}
                  {userThreads.length > 3 && (
                    <div className="text-center">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View all {userThreads.length} questions →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Answers */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <ChatBubbleLeftIcon className="h-6 w-6 mr-2 text-green-500" />
                  Recent Answers
                </h3>
                <span className="text-sm text-gray-500">{userReplies.length} total</span>
              </div>
              
              {repliesLoading ? (
                <div className="card text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your answers...</p>
                </div>
              ) : userReplies.length === 0 ? (
                <div className="card text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-gray-500 mb-4">You haven't posted any answers yet.</p>
                  <a href="/" className="btn-secondary">Browse Questions</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReplies.slice(0, 3).map((reply) => (
                    <div key={reply.id} className="card hover:shadow-md transition-shadow">
                      <p className="text-gray-700 mb-3 line-clamp-3">{reply.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Reply to thread</span>
                        <span>{formatDistanceToNow(reply.createdAt)} ago</span>
                      </div>
                    </div>
                  ))}
                  {userReplies.length > 3 && (
                    <div className="text-center">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View all {userReplies.length} answers →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <ProfileSettings user={currentUser} />
      )}

      {activeTab === 'security' && (
        <PasswordChange />
      )}
      
      <ProfileDebug />
    </div>
  )
}