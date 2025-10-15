import { 
  collection, 
  getDocs, 
  orderBy, 
  query 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { User } from '../types'

interface ReportedContent {
  id: string
  type: 'thread' | 'reply'
  contentId: string
  content: string
  reason: string
  reporterId: string
  reporterName: string
  createdAt: Date
}

export const getReportedContent = async (): Promise<ReportedContent[]> => {
  // This would typically query a 'reports' collection
  // For now, returning empty array as placeholder
  return []
}

export const getAllUsers = async (): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as User[]
}