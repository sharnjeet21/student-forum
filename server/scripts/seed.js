const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User')
const Thread = require('../models/Thread')
const Reply = require('../models/Reply')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Thread.deleteMany({})
    await Reply.deleteMany({})

    console.log('🗑️  Cleared existing data')

    // Create admin user
    const adminUser = new User({
      displayName: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
      reputation: 1000
    })
    await adminUser.save()

    // Create regular users
    const users = []
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        displayName: `Student ${i}`,
        email: `student${i}@example.com`,
        password: 'password123',
        reputation: Math.floor(Math.random() * 500)
      })
      await user.save()
      users.push(user)
    }

    console.log('👥 Created users')

    // Create sample threads
    const categories = ['general', 'homework', 'programming', 'math', 'science']
    const threads = []

    for (let i = 1; i <= 10; i++) {
      const thread = new Thread({
        title: `Sample Question ${i}: How to solve this problem?`,
        content: `This is a detailed question about topic ${i}. I'm having trouble understanding the concept and would appreciate any help from the community.`,
        category: categories[Math.floor(Math.random() * categories.length)],
        author: users[Math.floor(Math.random() * users.length)]._id,
        tags: [`tag${i}`, 'help', 'question'],
        upvotes: Array.from({ length: Math.floor(Math.random() * 5) }, () => ({
          user: users[Math.floor(Math.random() * users.length)]._id
        })),
        views: Math.floor(Math.random() * 100)
      })
      await thread.save()
      threads.push(thread)
    }

    console.log('📝 Created threads')

    // Create sample replies
    for (const thread of threads) {
      const numReplies = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < numReplies; i++) {
        const reply = new Reply({
          content: `This is a helpful reply to the question. Here's my suggestion for solving this problem...`,
          thread: thread._id,
          author: users[Math.floor(Math.random() * users.length)]._id,
          upvotes: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
            user: users[Math.floor(Math.random() * users.length)]._id
          }))
        })
        await reply.save()
      }
    }

    console.log('💬 Created replies')
    console.log('✅ Seed data created successfully!')
    console.log('\n📋 Test Accounts:')
    console.log('Admin: admin@example.com / password123')
    console.log('Student: student1@example.com / password123')
    
  } catch (error) {
    console.error('❌ Seed error:', error)
  } finally {
    mongoose.connection.close()
  }
}

const run = async () => {
  await connectDB()
  await seedData()
}

run()