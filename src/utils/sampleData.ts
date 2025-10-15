import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export const createSampleData = async () => {
  try {
    const sampleThreads = [
      {
        title: "How to solve quadratic equations?",
        content: "I'm having trouble understanding the quadratic formula. Can someone explain the steps and maybe provide an example?",
        category: "math",
        authorId: "sample-user-1",
        authorName: "Alex Student",
        tags: ["algebra", "equations", "help"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        upvotes: 5,
        downvotes: 0,
        replyCount: 3,
        isResolved: false,
      },
      {
        title: "Best practices for React hooks?",
        content: "I'm new to React hooks and want to know the best practices. When should I use useState vs useEffect?",
        category: "programming",
        authorId: "sample-user-2",
        authorName: "Sarah Coder",
        tags: ["react", "hooks", "javascript"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        upvotes: 8,
        downvotes: 1,
        replyCount: 5,
        isResolved: true,
      },
      {
        title: "Understanding photosynthesis process",
        content: "Can someone explain the light and dark reactions in photosynthesis? I'm preparing for my biology exam.",
        category: "science",
        authorId: "sample-user-3",
        authorName: "Mike Biology",
        tags: ["biology", "photosynthesis", "exam"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        upvotes: 3,
        downvotes: 0,
        replyCount: 2,
        isResolved: false,
      },
      {
        title: "Help with Shakespeare analysis",
        content: "I need help analyzing the themes in Hamlet. What are the main themes and how do they develop throughout the play?",
        category: "literature",
        authorId: "sample-user-4",
        authorName: "Emma Reader",
        tags: ["shakespeare", "hamlet", "analysis"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        upvotes: 4,
        downvotes: 0,
        replyCount: 1,
        isResolved: false,
      },
      {
        title: "Study group for calculus?",
        content: "Anyone interested in forming a study group for calculus? We could meet online and help each other with problems.",
        category: "general",
        authorId: "sample-user-5",
        authorName: "David Math",
        tags: ["study-group", "calculus", "collaboration"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        upvotes: 12,
        downvotes: 0,
        replyCount: 8,
        isResolved: false,
      }
    ]

    console.log('Creating sample threads...')
    
    for (const thread of sampleThreads) {
      await addDoc(collection(db, 'threads'), thread)
    }
    
    console.log('✅ Sample data created successfully!')
    return true
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
    throw error
  }
}