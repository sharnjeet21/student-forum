import { useState } from 'react'
import { useQuery } from 'react-query'
import { getReportedContent, getAllUsers } from '../services/adminService'
import { 
  ExclamationTriangleIcon, 
  UserIcon, 
  ChatBubbleLeftIcon,
  TrashIcon,
  CheckIcon 
} from '@heroicons/react/24/outline'

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports')

  const { data: reportedContent = [] } = useQuery(
    ['reportedContent'],
    getReportedContent,
    {
      refetchOnWindowFocus: false,
    }
  )

  const { data: users = [] } = useQuery(
    ['allUsers'],
    getAllUsers,
    {
      refetchOnWindowFocus: false,
    }
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
            Reported Content ({reportedContent.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon className="h-5 w-5 inline mr-2" />
            Users ({users.length})
          </button>
        </nav>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportedContent.length === 0 ? (
            <div className="card text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reported content to review.</p>
            </div>
          ) : (
            reportedContent.map((report) => (
              <div key={report.id} className="card border-l-4 border-red-400">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        {report.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        Reported by {report.reporterName}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{report.reason}</p>
                    <p className="text-gray-700">{report.content}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user.id} className="card">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-500">
                  <span>Reputation: {user.reputation}</span>
                  <span className={user.isAdmin ? 'text-green-600' : ''}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}