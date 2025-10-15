require('dotenv').config()
const mongoose = require('mongoose')
const Thread = require('./models/Thread')
const Reply = require('./models/Reply')
const User = require('./models/User')

async function checkAI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📊 Checking AI system status...')
    
    // Check recent threads
    const recentThreads = await Thread.find().sort({createdAt: -1}).limit(3)
    console.log(`\nRecent threads: ${recentThreads.length}`)
    recentThreads.forEach(t => console.log(`- ${t.title} (${t.createdAt})`))
    
    // Check AI replies
    const aiReplies = await Reply.find({isAIGenerated: true}).sort({createdAt: -1}).limit(5)
    console.log(`\nAI replies found: ${aiReplies.length}`)
    
    // Check AI bot user
    const aiBot = await User.findOne({email: 'aibot@studentforum.com'})
    console.log(`AI Bot exists: ${!!aiBot}`)
    if (aiBot) {
      console.log(`AI Bot name: ${aiBot.displayName}`)
    }
    
    // Check total replies for recent threads
    for (const thread of recentThreads) {
      const replies = await Reply.find({thread: thread._id})
      console.log(`Thread "${thread.title}" has ${replies.length} replies`)
    }
    
    mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAI()