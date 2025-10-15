require('dotenv').config()
const mongoose = require('mongoose')
const Thread = require('./models/Thread')
const Reply = require('./models/Reply')
const User = require('./models/User')

async function testNewThread() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🧪 Testing new thread creation with AI response...')
    
    // Find a test user (or create one)
    let testUser = await User.findOne({ email: { $ne: 'aibot@studentforum.com' } })
    if (!testUser) {
      console.log('Creating test user...')
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test Student'
      })
      await testUser.save()
    }
    
    console.log(`👤 Using test user: ${testUser.displayName}`)
    
    // Create a new thread
    const newThread = new Thread({
      title: 'How do I calculate the area of a circle?',
      content: 'I need help understanding how to find the area of a circle. I know it involves π (pi) but I\'m not sure about the formula. Can someone explain the steps?',
      category: 'math',
      tags: ['geometry', 'circle', 'area'],
      author: testUser._id
    })
    
    await newThread.save()
    console.log(`📝 Created new thread: "${newThread.title}"`)
    
    // Wait a moment for any async AI processing
    console.log('⏳ Waiting 3 seconds for AI response...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if AI replied
    const aiReplies = await Reply.find({ 
      thread: newThread._id, 
      isAIGenerated: true 
    }).populate('author', 'displayName')
    
    console.log(`🤖 AI replies found: ${aiReplies.length}`)
    
    if (aiReplies.length > 0) {
      const aiReply = aiReplies[0]
      console.log(`✅ AI replied by: ${aiReply.author.displayName}`)
      console.log(`📊 Confidence: ${aiReply.aiConfidence}`)
      console.log(`💡 Follow-up questions: ${aiReply.followUpQuestions.length}`)
      console.log(`📖 Answer preview: ${aiReply.content.substring(0, 200)}...`)
    } else {
      console.log('❌ No AI reply found - the automatic system may not be working')
    }
    
    mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testNewThread()