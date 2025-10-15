import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserCircleIcon, 
  PlusIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface HeaderProps {
  onMenuToggle: () => void
  isMobileMenuOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <span className="text-white font-bold text-sm lg:text-lg">SF</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-2xl font-bold gradient-text">StudentForum</h1>
                <p className="text-xs text-gray-500 -mt-1 hidden lg:block">Learn Together</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {currentUser ? (
              <>
                <Link
                  to="/search"
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="Search discussions"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </Link>
                <Link
                  to="/create-thread"
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Ask Question</span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {currentUser.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{currentUser.displayName}</p>
                      <p className="text-xs text-gray-500">{currentUser.reputation} points</p>
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-slide-up">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <UserCircleIcon className="h-5 w-5 mr-3 text-blue-500" />
                      My Profile
                    </Link>
                    {currentUser.isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-150"
                      >
                        <Cog6ToothIcon className="h-5 w-5 mr-3 text-purple-500" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            {currentUser ? (
              <>
                <Link
                  to="/search"
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/create-thread"
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <PlusIcon className="h-5 w-5" />
                </Link>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md"
                  >
                    <span className="text-white font-semibold text-xs">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 py-2 z-10">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserCircleIcon className="h-4 w-4 mr-3 text-blue-500" />
                        My Profile
                      </Link>
                      {currentUser.isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-purple-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Cog6ToothIcon className="h-4 w-4 mr-3 text-purple-500" />
                          Admin Panel
                        </Link>
                      )}
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={() => {
                          handleLogout()
                          setShowUserMenu(false)
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}