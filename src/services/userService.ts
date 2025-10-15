import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Thread, Reply } from '../types'

export const getUserThreads = async (userId: string): Promise<Thread[]> => {
  try {
    console.log('🔍 Fetching threads for user:', userId)
    
    // Simple query without orderBy to avoid index issues
    const q = query(
      collection(db, 'threads'),
      where('authorId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    console.log('📝 Found threads:', snapshot.size)
    
    const threads = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('📄 Thread data:', { id: doc.id, title: data.title, authorId: data.authorId })
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    }) as Thread[]
    
    // Sort client-side
    threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return threads
  } catch (error) {
    console.error('❌ Error fetching user threads:', error)
    return []
  }
}

export const getUserReplies = async (userId: string): Promise<Reply[]> => {
  try {
    console.log('🔍 Fetching replies for user:', userId)
    
    // Simple query without orderBy to avoid index issues
    const q = query(
      collection(db, 'replies'),
      where('authorId', '==', userId)
    )
    
    const snapshot = await getDocs(q)
    console.log('💬 Found replies:', snapshot.size)
    
    const replies = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('💭 Reply data:', { id: doc.id, content: data.content?.substring(0, 50), authorId: data.authorId })
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      }
    }) as Reply[]
    
    // Sort client-side
    replies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return replies
  } catch (error) {
    console.error('❌ Error fetching user replies:', error)
    return []
  }
}