import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ThreadCard } from '../components/forum/ThreadCard'
import { SearchBar } from '../components/forum/SearchBar'
import { FilterDropdown } from '../components/forum/FilterDropdown'
import { SampleDataButton } from '../components/admin/SampleDataButton'
import { MobileCategorySelector } from '../components/mobile/MobileCategorySelector'
import { getThreads } from '../services/threadService'
import { Thread } from '../types'

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest')

  const { data: threads = [], isLoading, error } = useQuery(
    ['threads', category, searchTerm, sortBy],
    () => getThreads({ category, searchTerm, sortBy }),
    {
      refetchOnWindowFocus: false,
    }
  )

  const getCategoryTitle = () => {
    if (!category) return 'All Discussions'
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
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
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Connection Error
          </h3>
          <p className="text-gray-600 mb-8">
            Unable to connect to the database. Please check your internet connection and try again.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary w-full"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Mobile Category Selector */}
      <MobileCategorySelector />

      {/* Hero Section */}
      <div className="text-center py-6 lg:py-12 px-4 lg:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl lg:text-5xl font-bold gradient-text mb-4">
            {getCategoryTitle()}
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 leading-relaxed">
            {category 
              ? `Explore ${category} discussions and get help from fellow students`
              : 'Connect with students worldwide. Ask questions, share knowledge, and learn together.'
            }
          </p>
          <Link to="/create-thread" className="btn-primary text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4">
            🚀 Ask Your First Question
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <FilterDropdown value={sortBy} onChange={setSortBy} />
            <div className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `${threads.length} discussion${threads.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {threads.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💭</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm || category 
                ? 'No discussions found' 
                : 'No discussions created yet'
              }
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm || category 
                ? 'Try adjusting your search or browse other categories.' 
                : 'Be the first to start a discussion and help build our learning community!'
              }
            </p>
            <div className="space-y-3">
              <Link to="/create-thread" className="btn-primary">
                🚀 Start First Discussion
              </Link>
              {!searchTerm && !category && (
                <div className="text-sm text-gray-500">
                  or try adding some sample data to explore the forum
                </div>
              )}
            </div>
          </div>
          {!searchTerm && !category && <SampleDataButton />}
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map((thread: Thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
          
          {/* Load More Button */}
          <div className="text-center pt-8">
            <button className="btn-secondary">
              Load More Discussions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}