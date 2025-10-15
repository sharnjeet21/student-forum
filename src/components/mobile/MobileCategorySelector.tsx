import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  QuestionMarkCircleIcon,
  BookOpenIcon,
  CodeBracketIcon,
  BeakerIcon,
  AcademicCapIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const categories = [
  { 
    id: 'all', 
    name: 'All Topics', 
    icon: HomeIcon, 
    gradient: 'from-gray-500 to-gray-600',
    href: '/'
  },
  { 
    id: 'general', 
    name: 'General', 
    icon: HomeIcon, 
    gradient: 'from-blue-500 to-cyan-500',
    href: '/category/general'
  },
  { 
    id: 'homework', 
    name: 'Homework', 
    icon: QuestionMarkCircleIcon, 
    gradient: 'from-green-500 to-emerald-500',
    href: '/category/homework'
  },
  { 
    id: 'programming', 
    name: 'Programming', 
    icon: CodeBracketIcon, 
    gradient: 'from-purple-500 to-violet-500',
    href: '/category/programming'
  },
  { 
    id: 'math', 
    name: 'Math', 
    icon: BeakerIcon, 
    gradient: 'from-red-500 to-pink-500',
    href: '/category/math'
  },
  { 
    id: 'science', 
    name: 'Science', 
    icon: AcademicCapIcon, 
    gradient: 'from-orange-500 to-yellow-500',
    href: '/category/science'
  },
  { 
    id: 'literature', 
    name: 'Literature', 
    icon: BookOpenIcon, 
    gradient: 'from-indigo-500 to-purple-500',
    href: '/category/literature'
  },
]

export const MobileCategorySelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const getCurrentCategory = () => {
    const current = categories.find(cat => 
      cat.href === location.pathname || 
      (location.pathname.includes('/category/') && location.pathname.includes(cat.id))
    )
    return current || categories[0]
  }

  const currentCategory = getCurrentCategory()

  return (
    <div className="lg:hidden mb-6">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${currentCategory.gradient} rounded-lg flex items-center justify-center`}>
              <currentCategory.icon className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">{currentCategory.name}</span>
          </div>
          <ChevronDownIcon className={clsx(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 py-2 z-10 animate-slide-up">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = category.href === location.pathname || 
                              (location.pathname.includes('/category/') && location.pathname.includes(category.id))
              
              return (
                <Link
                  key={category.id}
                  to={category.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center space-x-3 px-4 py-3 transition-colors duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${category.gradient} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{category.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}