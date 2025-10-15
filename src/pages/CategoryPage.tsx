import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ThreadCard } from '../components/forum/ThreadCard'
import { SearchBar } from '../components/forum/SearchBar'
import { FilterDropdown } from '../components/forum/FilterDropdown'
import { getThreads } from '../services/threadService'
import { Thread } from '../types'

const categoryInfo: Record<string, { name: string; description: string; icon: string; gradient: string }> = {
  general: {
    name: 'General Discussion',
    description: 'Open discussions about any topic related to learning and education',
    icon: '💬',
    gradient: 'from-blue-500 to-cyan-500'
  },
  homework: {
    name: 'Homework Help',
    description: 'Get help with your assignments and homework questions',
    icon: '📚',
    gradient: 'from-green-500 to-emerald-500'
  },
  programming: {
    name: 'Programming',
    description: 'Coding questions, debugging help, and programming discussions',
    icon: '💻',
    gradient: 'from-purple-500 to-violet-500'
  },
  math: {
    name: 'Mathematics',
    description: 'Mathematical problems, formulas, and concept explanations',
    icon: '🔢',
    gradient: 'from-red-500 to-pink-500'
  },
  science: {
    name: 'Science',
    description: 'Physics, chemistry, biology, and other scientific topics',
    icon: '🔬',
    gradient: 'from-orange-500 to-yellow-500'
  },
  literature: {
    name: 'Literature',
    description: 'Book analysis, writing help, and literary discussions',
    icon: '📖',
    gradient: 'from-indigo-500 to-purple-500'
  }
}

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest')

  const category = categoryId ? categoryInfo[categoryId] : null

  const { data: threads = [], isLoading, error } = useQuery(
    ['threads', categoryId, searchTerm, sortBy],
    () => getThreads({ category: categoryId, searchTerm, sortBy }),
    {
      refetchOnWindowFocus: false,
    }
  )

  if (!category) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h3>
        <p className="text-gray-600 mb-8">Unable to load discussions for this category.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          🔄 Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="text-center py-12">
        <div className={`w-20 h-20 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <span className="text-3xl">{category.icon}</span>
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4">{category.name}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">{category.description}</p>
        <Link to="/create-thread" className="btn-primary">
          🚀 Ask a Question
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="flex items-center space-x-4">
            <FilterDropdown value={sortBy} onChange={setSortBy} />
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {isLoading ? 'Loading...' : `${threads.length} discussion${threads.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      {/* Threads */}
      {threads.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">{category.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {searchTerm ? 'No discussions found' : `No ${category.name.toLowerCase()} discussions yet`}
          </h3>
          <p className="text-gray-600 mb-8">
            {searchTerm 
              ? 'Try adjusting your search terms or browse other categories.' 
              : `Be the first to start a discussion in ${category.name.toLowerCase()}!`
            }
          </p>
          <Link to="/create-thread" className="btn-primary">
            🎯 Start First Discussion
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map((thread: Thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  )
}