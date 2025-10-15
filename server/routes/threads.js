const express = require('express')
const { body, validationResult, query } = require('express-validator')
const Thread = require('../models/Thread')
const Reply = require('../models/Reply')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { testAuth } = require('../middleware/testAuth')
const { upload, handleUploadError } = require('../middleware/upload')
const geminiService = require('../services/geminiService')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// @route   GET /api/threads
// @desc    Get all threads with filtering and pagination
// @access  Public
router.get('/', [
  query('category').optional().isIn(['general', 'homework', 'programming', 'math', 'science', 'literature']),
  query('sort').optional().isIn(['newest', 'popular', 'unanswered']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { category, search, sort = 'newest', page = 1, limit = 20 } = req.query

    // Build query
    let query = {}
    if (category) query.category = category
    if (search) {
      query.$text = { $search: search }
    }

    // Build sort
    let sortQuery = {}
    switch (sort) {
      case 'popular':
        sortQuery = { upvotes: -1, createdAt: -1 }
        break
      case 'unanswered':
        query.replyCount = 0
        sortQuery = { createdAt: -1 }
        break
      default:
        sortQuery = { isPinned: -1, createdAt: -1 }
    }

    const threads = await Thread.find(query)
      .populate('author', 'displayName avatar')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    // Add vote scores
    const threadsWithScores = threads.map(thread => ({
      ...thread,
      voteScore: thread.upvotes.length - thread.downvotes.length,
      upvotes: thread.upvotes.length,
      downvotes: thread.downvotes.length
    }))

    const total = await Thread.countDocuments(query)

    res.json({
      success: true,
      threads: threadsWithScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/threads/:id
// @desc    Get single thread
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('author', 'displayName avatar reputation')
      .lean()

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' })
    }

    // Increment view count
    await Thread.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

    // Add vote scores
    const threadWithScore = {
      ...thread,
      voteScore: thread.upvotes.length - thread.downvotes.length,
      upvotes: thread.upvotes.length,
      downvotes: thread.downvotes.length
    }

    res.json({
      success: true,
      thread: threadWithScore
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/threads
// @desc    Create new thread
// @access  Private
router.post('/', process.env.NODE_ENV === 'development' ? testAuth : auth, upload, handleUploadError, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 10000 }).withMessage('Content must be 10-10000 characters'),
  body('category').isIn(['general', 'homework', 'programming', 'math', 'science', 'literature']),
  body('tags').optional().custom((value) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) && parsed.length <= 5
      } catch {
        return false
      }
    }
    return Array.isArray(value) && value.length <= 5
  }).withMessage('Maximum 5 tags allowed')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err)
          })
        })
      }
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, content, category } = req.body
    let { tags = [] } = req.body

    // Parse tags if they come as string (from FormData)
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags)
      } catch {
        tags = []
      }
    }

    // Process attachments
    const attachments = []
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        })
      })
    }

    const thread = new Thread({
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [], // Limit to 5 tags
      author: req.user._id,
      attachments
    })

    await thread.save()
    await thread.populate('author', 'displayName avatar reputation')

    // Generate AI response asynchronously (don't wait for it)
    generateAIResponse(thread._id, title, content, category)

    res.status(201).json({
      success: true,
      thread: {
        ...thread.toObject(),
        voteScore: 0,
        upvotes: 0,
        downvotes: 0
      }
    })
  } catch (error) {
    console.error(error)
    // Clean up uploaded files if thread creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err)
        })
      })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/threads/:id/vote
// @desc    Vote on thread
// @access  Private
router.put('/:id/vote', auth, [
  body('type').isIn(['upvote', 'downvote', 'remove']).withMessage('Invalid vote type')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { type } = req.body
    const thread = await Thread.findById(req.params.id)

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' })
    }

    // Remove existing votes
    thread.upvotes = thread.upvotes.filter(vote => vote.user.toString() !== req.user._id.toString())
    thread.downvotes = thread.downvotes.filter(vote => vote.user.toString() !== req.user._id.toString())

    // Add new vote if not removing
    if (type === 'upvote') {
      thread.upvotes.push({ user: req.user._id })
    } else if (type === 'downvote') {
      thread.downvotes.push({ user: req.user._id })
    }

    await thread.save()

    res.json({
      success: true,
      voteScore: thread.upvotes.length - thread.downvotes.length,
      upvotes: thread.upvotes.length,
      downvotes: thread.downvotes.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/threads/uploads/:filename
// @desc    Serve uploaded files
// @access  Public
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(__dirname, '../uploads', filename)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' })
    }
    
    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === '.pdf') {
      contentType = 'application/pdf'
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg'
    }
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
    
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to generate AI response
async function generateAIResponse(threadId, title, content, category) {
  try {
    console.log(`🤖 Generating AI response for thread: ${threadId}`)
    console.log(`📝 Title: ${title}`)
    console.log(`📂 Category: ${category}`)
    
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
    }

    console.log('🧠 Calling Gemini API...')
    // Generate AI answer
    const aiResponse = await geminiService.generateAnswer(
      `${title}\n\n${content}`,
      category,
      'This is a student forum question that needs a helpful educational response.'
    )

    if (aiResponse.success) {
      console.log(`✅ AI answer generated (${aiResponse.answer.length} chars, confidence: ${aiResponse.confidence})`)
      
      // Generate follow-up questions
      console.log('💡 Generating follow-up questions...')
      const followUpQuestions = await geminiService.generateFollowUpQuestions(
        `${title}\n\n${content}`,
        aiResponse.answer,
        category
      )
      console.log(`💡 Generated ${followUpQuestions.length} follow-up questions`)

      // Create AI reply
      const truncatedQuestions = followUpQuestions.map(q => q.length > 200 ? q.substring(0, 197) + '...' : q)
      const aiReply = new Reply({
        content: aiResponse.answer,
        thread: threadId,
        author: aiBot._id,
        isAIGenerated: true,
        aiConfidence: aiResponse.confidence,
        followUpQuestions: truncatedQuestions
      })

      await aiReply.save()
      console.log(`✅ AI response saved to database for thread: ${threadId}`)
    } else {
      console.error(`❌ Failed to generate AI response: ${aiResponse.error}`)
    }
  } catch (error) {
    console.error('❌ Error generating AI response:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

module.exports = router