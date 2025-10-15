import { 
  collection, 
  getDocs, 
  query, 
  where,
  getCountFromServer
} from 'firebase/firestore'
import { db } from '../config/firebase'

export interface ForumStats {
  totalThreads: number
  totalUsers: number
  totalReplies: number
  solvedToday: number
  categoryStats: Record<string, number>
}

export const getForumStats = async (): Promise<ForumStats> => {
  try {
    console.log('🔄 Fetching forum stats...')
    
    // Use getDocs instead of getCountFromServer for better compatibility
    const threadsSnapshot = await getDocs(collection(db, 'threads'))
    const totalThreads = threadsSnapshot.size

    const usersSnapshot = await getDocs(collection(db, 'users'))
    const totalUsers = usersSnapshot.size

    const repliesSnapshot = await getDocs(collection(db, 'replies'))
    const totalReplies = repliesSnapshot.size

    // Get solved threads today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let solvedToday = 0
    try {
      const solvedTodayQuery = query(
        collection(db, 'threads'),
        where('isResolved', '==', true),
        where('updatedAt', '>=', today)
      )
      const solvedTodaySnapshot = await getDocs(solvedTodayQuery)
      solvedToday = solvedTodaySnapshot.size
    } catch (error) {
      console.log('Could not fetch solved today stats, using 0')
      solvedToday = 0
    }

    // Get category statistics from the threads we already fetched
    const categories = ['general', 'homework', 'programming', 'math', 'science', 'literature']
    const categoryStats: Record<string, number> = {}

    // Initialize all categories to 0
    categories.forEach(category => {
      categoryStats[category] = 0
    })

    // Count threads by category
    threadsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      const category = data.category
      if (categories.includes(category)) {
        categoryStats[category]++
      }
    })

    const stats = {
      totalThreads,
      totalUsers,
      totalReplies,
      solvedToday,
      categoryStats
    }

    console.log('📊 Forum stats fetched:', stats)
    return stats
  } catch (error) {
    console.error('❌ Error fetching forum stats:', error)
    // Return default stats if there's an error
    const defaultStats = {
      totalThreads: 0,
      totalUsers: 0,
      totalReplies: 0,
      solvedToday: 0,
      categoryStats: {
        general: 0,
        homework: 0,
        programming: 0,
        math: 0,
        science: 0,
        literature: 0
      }
    }
    console.log('📊 Using default stats:', defaultStats)
    return defaultStats
  }
}