import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { createThread } from '../services/threadService'
import toast from 'react-hot-toast'

interface ThreadForm {
  title: string
  content: string
  category: string
  tags: string
}

const categories = [
  { value: 'general', label: 'General Discussion' },
  { value: 'homework', label: 'Homework Help' },
  { value: 'programming', label: 'Programming' },
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'literature', label: 'Literature' },
]

export const CreateThreadPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<ThreadForm>()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Validate file types and sizes
    const validFiles: File[] = []
    const errors: string[] = []
    
    files.forEach(file => {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG, JPG, and PDF files are allowed`)
        return
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be under 10MB`)
        return
      }
      
      validFiles.push(file)
    })
    
    // Check total file count (max 5)
    if (attachments.length + validFiles.length > 5) {
      errors.push('Maximum 5 files allowed')
      return
    }
    
    if (errors.length > 0) {
      toast.error(errors.join('\n'))
      return
    }
    
    setAttachments(prev => [...prev, ...validFiles])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return '📄'
    if (type.startsWith('image/')) return '🖼️'
    return '📎'
  }

  const onSubmit = async (data: ThreadForm) => {
    if (!currentUser) return

    setLoading(true)
    try {
      const tags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const threadId = await createThread({
        title: data.title,
        content: data.content,
        category: data.category,
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        tags,
        attachments
      })

      // Refresh relevant queries to update stats immediately
      await queryClient.invalidateQueries('threads')
      await queryClient.invalidateQueries('forumStats')
      
      // Force refetch of stats
      await queryClient.refetchQueries('forumStats')

      toast.success('Discussion created successfully! Stats will update shortly.')
      navigate(`/thread/${threadId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create discussion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
          <span className="text-2xl lg:text-3xl">💡</span>
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold gradient-text mb-3 lg:mb-4">Ask a Question</h1>
        <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Share your question with the community and get help from fellow students around the world.
        </p>
      </div>

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-3">
              Question Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="input-modern text-lg"
              placeholder="What's your question? Be specific and clear..."
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-lg font-semibold text-gray-900 mb-3">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input-modern"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block text-lg font-semibold text-gray-900 mb-3">
                Tags (optional)
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input-modern"
                placeholder="e.g., javascript, react, debugging"
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <span className="mr-1">💡</span>
                Add relevant tags to help others find your question
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-lg font-semibold text-gray-900 mb-3">
              Detailed Description *
            </label>
            <textarea
              {...register('content', { required: 'Description is required' })}
              rows={10}
              className="input-modern resize-none"
              placeholder="Provide as much detail as possible. Include what you've tried, what you expected to happen, and what actually happened. The more context you provide, the better help you'll receive!"
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.content.message}
              </p>
            )}
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Attachments (optional)
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 5}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span className="mr-2">📎</span>
                Add Files (JPEG, JPG, PDF)
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Maximum 5 files, 10MB each. Supported formats: JPEG, JPG, PDF
              </p>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Selected Files:</h4>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">✨</span>
              Tips for a Great Question
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-green-500">•</span>
                Be specific and clear in your title
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">•</span>
                Include relevant code, error messages, or examples
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">•</span>
                Explain what you've already tried
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">•</span>
                Use proper tags to reach the right audience
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Publish Question
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}