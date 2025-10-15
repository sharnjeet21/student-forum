import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  increment,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Reply } from '../types'

export const getReplies = async (threadId: string): Promise<Reply[]> => {
  // Temporary fix: Remove orderBy to avoid index requirement
  const q = query(
    collection(db, 'replies'),
    where('threadId', '==', threadId)
  )
  
  const snapshot = await getDocs(q)
  const replies = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Reply[]
  
  // Sort in JavaScript instead of Firestore
  return replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

export const createReply = async (replyData: Omit<Reply, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes' | 'isAccepted'>): Promise<string> => {
  const now = Timestamp.now()
  
  // Create the reply - convert undefined to null for Firestore
  const docRef = await addDoc(collection(db, 'replies'), {
    ...replyData,
    parentReplyId: replyData.parentReplyId || null,
    createdAt: now,
    updatedAt: now,
    upvotes: 0,
    downvotes: 0,
    isAccepted: false,
  })
  
  // Update thread reply count
  const threadRef = doc(db, 'threads', replyData.threadId)
  await updateDoc(threadRef, {
    replyCount: increment(1),
    updatedAt: now,
  })
  
  return docRef.id
}

export const updateReply = async (id: string, updates: Partial<Reply>): Promise<void> => {
  const docRef = doc(db, 'replies', id)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

export const deleteReply = async (id: string, threadId: string): Promise<void> => {
  const docRef = doc(db, 'replies', id)
  await deleteDoc(docRef)
  
  // Update thread reply count
  const threadRef = doc(db, 'threads', threadId)
  await updateDoc(threadRef, {
    replyCount: increment(-1),
    updatedAt: Timestamp.now(),
  })
}