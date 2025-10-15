import { useQuery } from 'react-query'
import { getForumStats } from '../../services/statsService'

export const StatsDebug: React.FC = () => {
  const { data: stats, isLoading, dataUpdatedAt } = useQuery(
    'forumStats',
    getForumStats,
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  )

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50">
      <div className="mb-2 font-bold">📊 Stats Debug</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Last Update: {new Date(dataUpdatedAt).toLocaleTimeString()}</div>
      <div>Total Threads: {stats?.totalThreads || 0}</div>
      <div>Total Users: {stats?.totalUsers || 0}</div>
      <div className="mt-2 text-yellow-300">
        Categories:
      </div>
      {stats?.categoryStats && Object.entries(stats.categoryStats).map(([cat, count]) => (
        <div key={cat} className="ml-2">
          {cat}: {count}
        </div>
      ))}
    </div>
  )
}