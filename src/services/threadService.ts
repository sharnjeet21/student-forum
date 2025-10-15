import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Thread } from '../types'

interface GetThreadsParams {
  category?: string | null
  searchTerm?: string
  sortBy?: 'newest' | 'popular' | 'unanswered'
  limitCount?: number
}

export const getThreads = async (params: GetThreadsParams = {}): Promise<Thread[]> => {
  try {
    const { category, searchTerm, sortBy = 'newest', limitCount = 20 } = params
    
    // Start with the simplest possible query to avoid index issues
    let q = query(collection(db, 'threads'), limit(limitCount))
    
    // Only add constraints that don't require indexes
    if (category) {
      q = query(collection(db, 'threads'), where('category', '==', category), limit(limitCount))
    }
    
    const snapshot = await getDocs(q)
    let threads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Thread[]
    
    // Do all sorting and filtering client-side to avoid index requirements
    
    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      threads = threads.filter(thread => 
        thread.title.toLowerCase().includes(searchLower) ||
        thread.content.toLowerCase().includes(searchLower) ||
        thread.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // Filter by sort type
    if (sortBy === 'unanswered') {
      threads = threads.filter(thread => thread.replyCount === 0)
    }
    
    // Sort client-side
    switch (sortBy) {
      case 'newest':
        threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'popular':
        threads.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
        break
      case 'unanswered':
        threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        threads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    return threads
  } catch (error: any) {
    console.error('Error fetching threads:', error)
    
    // If it's an index error, return empty array with helpful message
    if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
      console.log('📋 Firestore Index Required')
      console.log('🔗 Click this link to create indexes automatically:', error.message.match(/https:\/\/[^\s]+/)?.[0])
      return []
    }
    
    // For other errors, throw them
    throw error
  }
}

export const getThread = async (id: string): Promise<Thread | null> => {
  const docRef = doc(db, 'threads', id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as Thread
  }
  
  return null
}

interface CreateThreadData {
  title: string
  content: string
  category: string
  authorId: string
  authorName: string
  tags: string[]
  attachments?: File[]
}

export const createThread = async (threadData: CreateThreadData): Promise<string> => {
  
  // If there are attachments, use the API service
  if (threadData.attachments && threadData.attachments.length > 0) {
    const { apiService } = await import('./apiService')
    const response = await apiService.createThread({
      title: threadData.title,
      content: threadData.content,
      category: threadData.category,
      tags: threadData.tags,
      attachments: threadData.attachments
    })
    
    return response.thread._id
  }
  
  // Otherwise, use Firebase as before
  const now = Timestamp.now()
  const fullThreadData = {
    title: threadData.title,
    content: threadData.content,
    category: threadData.category,
    authorId: threadData.authorId,
    authorName: threadData.authorName,
    tags: threadData.tags,
    createdAt: now,
    updatedAt: now,
    upvotes: 0,
    downvotes: 0,
    replyCount: 0,
    isResolved: false,
  }
  
  const docRef = await addDoc(collection(db, 'threads'), fullThreadData)
  
  // Generate AI reply asynchronously (don't wait for it)
  const thread: Thread = {
    id: docRef.id,
    ...fullThreadData,
    createdAt: fullThreadData.createdAt.toDate(),
    updatedAt: fullThreadData.updatedAt.toDate(),
  }
  
  // Generate AI reply automatically
  import('./aiReplyService').then(({ generateAIReplyWithDelay }) => {
    generateAIReplyWithDelay(thread, 3000)
  }).catch(() => {
    // Silently handle AI reply errors
  })
  
  return docRef.id
}

export const updateThread = async (id: string, updates: Partial<Thread>): Promise<void> => {
  const docRef = doc(db, 'threads', id)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

export const deleteThread = async (id: string): Promise<void> => {
  const docRef = doc(db, 'threads', id)
  await deleteDoc(docRef)
}