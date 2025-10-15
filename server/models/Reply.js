const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    maxlength: [5000, 'Reply cannot exceed 5000 characters']
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
    default: null
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  followUpQuestions: [{
    type: String,
    maxlength: [200, 'Follow-up question cannot exceed 200 characters']
  }]
}, {
  timestamps: true
})

// Virtual for vote score
replySchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length
})

// Update thread reply count when reply is saved
replySchema.post('save', async function() {
  const Thread = mongoose.model('Thread')
  const replyCount = await mongoose.model('Reply').countDocuments({ thread: this.thread })
  await Thread.findByIdAndUpdate(this.thread, { replyCount })
})

// Update thread reply count when reply is removed
replySchema.post('remove', async function() {
  const Thread = mongoose.model('Thread')
  const replyCount = await mongoose.model('Reply').countDocuments({ thread: this.thread })
  await Thread.findByIdAndUpdate(this.thread, { replyCount })
})

module.exports = mongoose.model('Reply', replySchema)