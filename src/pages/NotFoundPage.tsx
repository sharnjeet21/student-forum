import { Link } from 'react-router-dom'
import { HomeIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center max-w-md mx-auto px-4">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold gradient-text mb-4 animate-bounce-gentle">
            404
          </div>
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl">🤔</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off. 
          Don't worry, even the best students sometimes take a wrong turn!
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/" className="btn-primary w-full flex items-center justify-center">
            <HomeIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/search" className="btn-secondary flex items-center justify-center">
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search
            </Link>
            <Link to="/create-thread" className="btn-secondary flex items-center justify-center">
              <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
              Ask Question
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular sections:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/category/programming" className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors">
              Programming
            </Link>
            <Link to="/category/math" className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors">
              Mathematics
            </Link>
            <Link to="/category/science" className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors">
              Science
            </Link>
            <Link to="/category/homework" className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
              Homework Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}