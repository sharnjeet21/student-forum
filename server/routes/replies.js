const express = require('express')
const { body, validationResult } = require('express-validator')
const Reply = require('../models/Reply')
const Thread = require('../models/Thread')
const { auth } = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/replies/thread/:threadId
// @desc    Get replies for a thread
// @access  Public
router.get('/thread/:threadId', async (req, res) => {
  try {
    const replies = await Reply.find({ thread: req.params.threadId })
      .populate('author', 'displayName avatar reputation')
      .sort({ createdAt: 1 })
      .lean()

    // Add vote scores
    const repliesWithScores = replies.map(reply => ({
      ...reply,
      voteScore: reply.upvotes.length - reply.downvotes.length,
      upvotes: reply.upvotes.length,
      downvotes: reply.downvotes.length
    }))

    res.json({
      success: true,
      replies: repliesWithScores
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/replies
// @desc    Create new reply
// @access  Private
router.post('/', auth, [
  body('content').trim().isLength({ min: 5, max: 5000 }).withMessage('Reply must be 5-5000 characters'),
  body('thread').isMongoId().withMessage('Valid thread ID required'),
  body('parentReply').optional().isMongoId().withMessage('Valid parent reply ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { content, thread, parentReply } = req.body

    // Check if thread exists
    const threadExists = await Thread.findById(thread)
    if (!threadExists) {
      return res.status(404).json({ message: 'Thread not found' })
    }

    // Check if parent reply exists (if provided)
    if (parentReply) {
      const parentExists = await Reply.findById(parentReply)
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent reply not found' })
      }
    }

    const reply = new Reply({
      content,
      thread,
      author: req.user._id,
      parentReply: parentReply || null
    })

    await reply.save()
    await reply.populate('author', 'displayName avatar reputation')

    res.status(201).json({
      success: true,
      reply: {
        ...reply.toObject(),
        voteScore: 0,
        upvotes: 0,
        downvotes: 0
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/replies/:id/vote
// @desc    Vote on reply
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
    const reply = await Reply.findById(req.params.id)

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' })
    }

    // Remove existing votes
    reply.upvotes = reply.upvotes.filter(vote => vote.user.toString() !== req.user._id.toString())
    reply.downvotes = reply.downvotes.filter(vote => vote.user.toString() !== req.user._id.toString())

    // Add new vote if not removing
    if (type === 'upvote') {
      reply.upvotes.push({ user: req.user._id })
    } else if (type === 'downvote') {
      reply.downvotes.push({ user: req.user._id })
    }

    await reply.save()

    res.json({
      success: true,
      voteScore: reply.upvotes.length - reply.downvotes.length,
      upvotes: reply.upvotes.length,
      downvotes: reply.downvotes.length
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/replies/:id/accept
// @desc    Mark reply as accepted answer
// @access  Private (thread author only)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id).populate('thread')

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' })
    }

    // Check if user is thread author
    if (reply.thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only thread author can accept answers' })
    }

    // Remove accepted status from other replies in this thread
    await Reply.updateMany(
      { thread: reply.thread._id },
      { isAccepted: false }
    )

    // Mark this reply as accepted
    reply.isAccepted = true
    await reply.save()

    // Mark thread as resolved
    await Thread.findByIdAndUpdate(reply.thread._id, { isResolved: true })

    res.json({
      success: true,
      message: 'Reply marked as accepted answer'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router