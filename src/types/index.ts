export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  isAdmin: boolean
  createdAt: Date
  reputation: number
}

export interface Attachment {
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string
  uploadedAt: Date
}

export interface Thread {
  id: string
  title: string
  content: string
  category: string
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
  upvotes: number
  downvotes: number
  replyCount: number
  tags: string[]
  isResolved: boolean
  attachments?: Attachment[]
}

export interface Reply {
  id: string
  threadId: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
  upvotes: number
  downvotes: number
  parentReplyId?: string
  isAccepted: boolean
  isAIGenerated?: boolean
  aiConfidence?: number
  followUpQuestions?: string[]
}

export interface Vote {
  id: string
  userId: string
  targetId: string
  targetType: 'thread' | 'reply'
  type: 'upvote' | 'downvote'
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  description: string
  color: string
  threadCount: number
}