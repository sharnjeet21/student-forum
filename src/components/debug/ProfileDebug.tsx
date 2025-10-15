import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from 'react-query'
import { getUserThreads, getUserReplies } from '../../services/userService'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../config/firebase'

export const ProfileDebug: React.FC = () => {
  const { currentUser } = useAuth()

  const { data: userThreads = [], isLoading: threadsLoading } = useQuery(
    ['debug-userThreads', currentUser?.id],
    () => getUserThreads(currentUser!.id),
    {
      enabled: !!currentUser,
    }
  )

  const { data: allThreads = [], isLoading: allThreadsLoading } = useQuery(
    'debug-allThreads',
    async () => {
      const snapshot = await getDocs(collection(db, 'threads'))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }
  )

  if (!currentUser) return null

  return (
    <div className="fixed top-20 right-4 bg-black/90 text-white text-xs p-4 rounded-lg font-mono z-50 max-w-md max-h-96 overflow-auto">
      <div className="mb-3 font-bold text-yellow-300">🐛 Profile Debug Panel</div>
      
      <div className="space-y-2">
        <div><strong>Current User ID:</strong> {currentUser.id}</div>
        <div><strong>User Name:</strong> {currentUser.displayName}</div>
        <div><strong>User Email:</strong> {currentUser.email}</div>
        
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div><strong>User Threads Loading:</strong> {threadsLoading ? 'Yes' : 'No'}</div>
          <div><strong>User Threads Found:</strong> {userThreads.length}</div>
        </div>

        <div className="border-t border-gray-600 pt-2 mt-2">
          <div><strong>All Threads Loading:</strong> {allThreadsLoading ? 'Yes' : 'No'}</div>
          <div><strong>Total Threads in DB:</strong> {allThreads.length}</div>
        </div>

        {allThreads.length > 0 && (
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="font-bold text-green-300">All Threads in Database:</div>
            {allThreads.slice(0, 3).map((thread: any) => (
              <div key={thread.id} className="ml-2 text-xs">
                <div>ID: {thread.id}</div>
                <div>Title: {thread.title?.substring(0, 30)}...</div>
                <div>Author ID: {thread.authorId}</div>
                <div>Author Name: {thread.authorName}</div>
                <div className={thread.authorId === currentUser.id ? 'text-green-300' : 'text-red-300'}>
                  Match: {thread.authorId === currentUser.id ? 'YES' : 'NO'}
                </div>
                <div className="border-b border-gray-700 mb-1"></div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-600 pt-2 mt-2 space-y-2">
          <button
            onClick={async () => {
              console.log('🔍 Manual test: Fetching threads for user:', currentUser.id)
              try {
                const q = query(
                  collection(db, 'threads'),
                  where('authorId', '==', currentUser.id)
                )
                const snapshot = await getDocs(q)
                console.log('📊 Manual query result:', snapshot.size, 'threads found')
                snapshot.docs.forEach(doc => {
                  console.log('📄 Thread:', doc.id, doc.data())
                })
              } catch (error) {
                console.error('❌ Manual query error:', error)
              }
            }}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs mr-2"
          >
            Test Query
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}