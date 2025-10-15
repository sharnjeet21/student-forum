import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { User } from '../types'

// AI Bot user configuration
export const AI_BOT_CONFIG = {
  id: 'ai-study-assistant',
  email: 'ai@studentforum.com',
  displayName: 'AI Study Assistant',
  photoURL: '🤖',
  isAdmin: false,
  reputation: 1000,
  createdAt: new Date('2024-01-01'), // Set a fixed creation date
}

// Create or get the AI bot user
export const ensureAIBotUser = async (): Promise<User> => {
  const aiBotRef = doc(db, 'users', AI_BOT_CONFIG.id)
  
  try {
    // Check if AI bot user already exists
    const aiBotSnap = await getDoc(aiBotRef)
    
    if (aiBotSnap.exists()) {
      return {
        id: aiBotSnap.id,
        ...aiBotSnap.data(),
        createdAt: aiBotSnap.data().createdAt?.toDate() || AI_BOT_CONFIG.createdAt,
      } as User
    }
    
    // Create AI bot user if it doesn't exist
    const aiBotData = {
      email: AI_BOT_CONFIG.email,
      displayName: AI_BOT_CONFIG.displayName,
      photoURL: AI_BOT_CONFIG.photoURL,
      isAdmin: AI_BOT_CONFIG.isAdmin,
      reputation: AI_BOT_CONFIG.reputation,
      createdAt: Timestamp.fromDate(AI_BOT_CONFIG.createdAt),
    }
    
    await setDoc(aiBotRef, aiBotData)
    
    return {
      id: AI_BOT_CONFIG.id,
      ...aiBotData,
      createdAt: AI_BOT_CONFIG.createdAt,
    } as User
    
  } catch (error) {
    throw error
  }
}

// Get AI bot user (assumes it exists)
export const getAIBotUser = async (): Promise<User | null> => {
  try {
    const aiBotRef = doc(db, 'users', AI_BOT_CONFIG.id)
    const aiBotSnap = await getDoc(aiBotRef)
    
    if (aiBotSnap.exists()) {
      return {
        id: aiBotSnap.id,
        ...aiBotSnap.data(),
        createdAt: aiBotSnap.data().createdAt?.toDate() || AI_BOT_CONFIG.createdAt,
      } as User
    }
    
    return null
  } catch (error) {
    return null
  }
}