import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ThreadCard } from '../components/forum/ThreadCard'
import { SearchBar } from '../components/forum/SearchBar'
import { FilterDropdown } from '../components/forum/FilterDropdown'
import { getThreads } from '../services/threadService'
import { Thread } from '../types'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'unanswered'>('newest')

  const { data: threads = [], isLoading, error } = useQuery(
    ['search', searchTerm, sortBy],
    () => getThreads({ searchTerm, sortBy }),
    {
      enabled: !!searchTerm.trim(),
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm })
    } else {
      setSearchParams({})
    }
  }, [searchTerm, setSearchParams])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  if (!searchTerm.trim()) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MagnifyingGlassIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Search Discussions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to your questions by searching through thousands of discussions
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SearchBar 
            value={searchTerm} 
            onChange={handleSearch}
            placeholder="Search for topics, keywords, or questions..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-sm text-gray-600">Search through titles, content, and tags</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">Get relevant results as you type</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Filtered Results</h3>
            <p className="text-sm text-gray-600">Sort by relevance, date, or popularity</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="max-w-2xl mx-auto">
          <SearchBar 
            value={searchTerm} 
            onChange={handleSearch}
            placeholder="Search for topics, keywords, or questions..."
          />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for "{searchTerm}"...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="max-w-2xl mx-auto">
          <SearchBar 
            value={searchTerm} 
            onChange={handleSearch}
            placeholder="Search for topics, keywords, or questions..."
          />
        </div>
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Search Error</h3>
          <p className="text-gray-600 mb-8">Unable to perform search. Please try again.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Results for "{searchTerm}"
        </h1>
        <p className="text-gray-600">
          Found {threads.length} discussion{threads.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchBar 
          value={searchTerm} 
          onChange={handleSearch}
          placeholder="Search for topics, keywords, or questions..."
        />
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing results for "{searchTerm}"
        </div>
        <FilterDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* Results */}
      {threads.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't find any discussions matching "{searchTerm}". 
            Try different keywords or browse categories instead.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
            <div className="text-sm text-gray-500">or</div>
            <a href="/create-thread" className="btn-primary">
              Ask a New Question
            </a>
          </div>
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