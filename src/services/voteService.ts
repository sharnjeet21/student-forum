import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  updateDoc,
  query, 
  where, 
  Timestamp,
  runTransaction,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Vote } from '../types'

export const getUserVote = async (userId: string, targetId: string, targetType: 'thread' | 'reply'): Promise<Vote | null> => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('userId', '==', userId),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const voteDoc = snapshot.docs[0]
    return {
      id: voteDoc.id,
      ...voteDoc.data(),
      createdAt: voteDoc.data().createdAt?.toDate() || new Date(),
    } as Vote
  } catch (error) {
    return null
  }
}

export const castVote = async (
  userId: string, 
  targetId: string, 
  targetType: 'thread' | 'reply', 
  voteType: 'upvote' | 'downvote'
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      // Always create a new vote - no checking for existing votes
      const voteRef = doc(collection(db, 'votes'))
      transaction.set(voteRef, {
        userId,
        targetId,
        targetType,
        type: voteType,
        createdAt: Timestamp.now(),
      })
      
      // Simply increment the vote count
      const targetCollection = targetType === 'thread' ? 'threads' : 'replies'
      const targetRef = doc(db, targetCollection, targetId)
      
      if (voteType === 'upvote') {
        transaction.update(targetRef, {
          upvotes: increment(1)
        })
      } else {
        transaction.update(targetRef, {
          downvotes: increment(1)
        })
      }
    })
  } catch (error) {
    throw error
  }
}

export const getVoteCounts = async (targetId: string, targetType: 'thread' | 'reply'): Promise<{upvotes: number, downvotes: number}> => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    )
    
    const snapshot = await getDocs(q)
    
    let upvotes = 0
    let downvotes = 0
    
    snapshot.forEach(doc => {
      const vote = doc.data()
      if (vote.type === 'upvote') {
        upvotes++
      } else if (vote.type === 'downvote') {
        downvotes++
      }
    })
    
    return { upvotes, downvotes }
  } catch (error) {
    return { upvotes: 0, downvotes: 0 }
  }
}

// Function to sync vote counts for a target (useful for data consistency)
export const syncVoteCounts = async (targetId: string, targetType: 'thread' | 'reply'): Promise<void> => {
  try {
    const voteCounts = await getVoteCounts(targetId, targetType)
    const targetCollection = targetType === 'thread' ? 'threads' : 'replies'
    const targetRef = doc(db, targetCollection, targetId)
    
    await updateDoc(targetRef, {
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes
    })
  } catch (error) {
    throw error
  }
}