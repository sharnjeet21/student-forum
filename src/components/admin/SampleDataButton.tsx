import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { createSampleData } from '../../utils/sampleData'
import toast from 'react-hot-toast'

export const SampleDataButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleCreateSampleData = async () => {
    if (!confirm('This will create sample discussion threads. Continue?')) {
      return
    }

    setLoading(true)
    try {
      await createSampleData()
      
      // Refresh all relevant queries
      queryClient.invalidateQueries('threads')
      queryClient.invalidateQueries('forumStats')
      
      toast.success('Sample data created! Refresh the page to see discussions.')
      setTimeout(() => window.location.reload(), 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sample data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleCreateSampleData}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium disabled:opacity-50"
      >
        {loading ? '⏳ Creating...' : '🎯 Add Sample Data'}
      </button>
    </div>
  )
}