import { aiService } from './aiService'
import { createReply } from './replyService'
import { ensureAIBotUser } from './aiBotUserService'
import { Thread } from '../types'

export const generateAIReply = async (thread: Thread): Promise<void> => {
  try {
    // Ensure AI bot user exists in Firebase
    const aiBotUser = await ensureAIBotUser()
    
    // Generate AI answer
    const aiResponse = await aiService.generateAnswer(
      `${thread.title}\n\n${thread.content}`,
      thread.category,
      'This is a student forum question that needs a helpful educational response.'
    )

    if (!aiResponse.success || !aiResponse.answer) {
      throw new Error(aiResponse.error || 'Failed to generate AI response')
    }

    // Generate follow-up questions
    const followUpQuestions = await aiService.generateFollowUpQuestions(
      `${thread.title}\n\n${thread.content}`,
      aiResponse.answer,
      thread.category
    )

    // Create AI reply using the proper AI bot user
    await createReply({
      threadId: thread.id,
      content: aiResponse.answer,
      authorId: aiBotUser.id,
      authorName: aiBotUser.displayName,
      isAIGenerated: true,
      aiConfidence: aiResponse.confidence,
      followUpQuestions: followUpQuestions
    })
  } catch (error) {
    throw error
  }
}

// Function to generate AI reply with delay (to simulate thinking time)
export const generateAIReplyWithDelay = (thread: Thread, delayMs = 3000): void => {
  // Show initial notification
  if (typeof window !== 'undefined') {
    import('react-hot-toast').then(({ default: toast }) => {
      toast.success('🤖 AI Assistant is analyzing your question...', {
        duration: 3000,
        icon: '🤖',
        position: 'bottom-right'
      })
    })
  }
  
  setTimeout(async () => {
    try {
      await generateAIReply(thread)
      
      // Show success notification
      if (typeof window !== 'undefined') {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.success('✨ AI Assistant has provided a helpful response!', {
            duration: 4000,
            icon: '✨',
            position: 'bottom-right'
          })
        })
      }
    } catch (error) {
      console.error('❌ Error in delayed AI reply:', error)
      
      // Show error notification
      if (typeof window !== 'undefined') {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error('❌ AI Assistant encountered an issue. Please try again.', {
            duration: 4000,
            position: 'bottom-right'
          })
        })
      }
    }
  }, delayMs)
}