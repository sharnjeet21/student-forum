import { useQuery, useQueryClient } from 'react-query'
import { getForumStats } from '../services/statsService'

export const useForumStats = () => {
  const queryClient = useQueryClient()

  const query = useQuery(
    'forumStats',
    getForumStats,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchOnWindowFocus: false,
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  )

  const refreshStats = () => {
    queryClient.invalidateQueries('forumStats')
  }

  return {
    ...query,
    refreshStats
  }
}

export default useForumStats