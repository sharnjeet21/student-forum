require('dotenv').config()
const mongoose = require('mongoose')
const Thread = require('./models/Thread')
const Reply = require('./models/Reply')
const User = require('./models/User')
const geminiService = require('./services/geminiService')

async function testAIResponse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🧪 Testing AI response generation...')
    
    // Get a recent thread
    const thread = await Thread.findOne().sort({createdAt: -1})
    if (!thread) {
      console.log('❌ No threads found')
      return
    }
    
    console.log(`📝 Testing with thread: "${thread.title}"`)
    
    // Create or find AI bot user
    let aiBot = await User.findOne({ email: 'aibot@studentforum.com' })
    if (!aiBot) {
      console.log('🤖 Creating AI bot user...')
      aiBot = new User({
        email: 'aibot@studentforum.com',
        displayName: 'AI Study Assistant',
        isAdmin: false,
        reputation: 1000,
        avatar: '🤖',
        isAIGenerated: true
      })
      await aiBot.save()
      console.log('✅ AI bot user created')
    } else {
      console.log('✅ AI bot user exists')
    }

    // Generate AI answer
    console.log('🤖 Generating AI response...')
    const aiResponse = await geminiService.generateAnswer(
      `${thread.title}\n\n${thread.content}`,
      thread.category,
      'This is a student forum question that needs a helpful educational response.'
    )

    if (aiResponse.success) {
      console.log('✅ AI response generated successfully')
      console.log(`📊 Confidence: ${aiResponse.confidence}`)
      console.log(`📝 Answer length: ${aiResponse.answer.length} characters`)
      
      // Generate follow-up questions
      console.log('💡 Generating follow-up questions...')
      const followUpQuestions = await geminiService.generateFollowUpQuestions(
        `${thread.title}\n\n${thread.content}`,
        aiResponse.answer,
        thread.category
      )
      
      console.log(`💡 Generated ${followUpQuestions.length} follow-up questions`)

      // Create AI reply
      console.log('💾 Saving AI reply to database...')
      const truncatedQuestions = followUpQuestions.map(q => q.length > 200 ? q.substring(0, 197) + '...' : q)
      const aiReply = new Reply({
        content: aiResponse.answer,
        thread: thread._id,
        author: aiBot._id,
        isAIGenerated: true,
        aiConfidence: aiResponse.confidence,
        followUpQuestions: truncatedQuestions
      })

      await aiReply.save()
      console.log('✅ AI reply saved successfully')
      
      // Show first 200 chars of the answer
      console.log(`📖 Answer preview: ${aiResponse.answer.substring(0, 200)}...`)
      
    } else {
      console.error(`❌ Failed to generate AI response: ${aiResponse.error}`)
    }
    
    mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAIResponse()