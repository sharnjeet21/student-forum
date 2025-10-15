// Simple test authentication middleware for development
const User = require('../models/User')

const testAuth = async (req, res, next) => {
  try {
    // For testing, create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test@example.com' })
    
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'testpass123',
        isAdmin: false,
        reputation: 50
      })
      await testUser.save()
    }
    
    req.user = testUser
    next()
  } catch (error) {
    console.error('Test auth error:', error)
    res.status(500).json({ message: 'Authentication error' })
  }
}

module.exports = { testAuth }