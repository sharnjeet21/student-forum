import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusIcon as PlusIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid'
import clsx from 'clsx'

export const BottomNavigation: React.FC = () => {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) return null

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      isActive: location.pathname === '/'
    },
    {
      name: 'Search',
      href: '/search',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
      isActive: location.pathname === '/search'
    },
    {
      name: 'Ask',
      href: '/create-thread',
      icon: PlusIcon,
      iconSolid: PlusIconSolid,
      isActive: location.pathname === '/create-thread',
      isSpecial: true
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
      isActive: location.pathname.startsWith('/profile')
    },
    ...(currentUser.isAdmin ? [{
      name: 'Admin',
      href: '/admin',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
      isActive: location.pathname === '/admin'
    }] : [])
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-target',
                item.isSpecial
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : item.isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={clsx(
                item.isSpecial ? 'h-6 w-6' : 'h-5 w-5',
                'mb-1'
              )} />
              <span className={clsx(
                'text-xs font-medium',
                item.isSpecial && 'text-white'
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}