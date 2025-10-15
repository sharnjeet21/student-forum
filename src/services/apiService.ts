const API_BASE_URL = 'http://localhost:5001/api'

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  async createThread(data: {
    title: string
    content: string
    category: string
    tags: string[]
    attachments?: File[]
  }): Promise<{ success: boolean; thread: any }> {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('content', data.content)
    formData.append('category', data.category)
    formData.append('tags', JSON.stringify(data.tags))
    
    // Add attachments if any
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach(file => {
        formData.append('attachments', file)
      })
    }

    const response = await fetch(`${API_BASE_URL}/threads`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create thread')
    }

    return response.json()
  }

  async getThreads(params: {
    category?: string
    search?: string
    sort?: string
    page?: number
    limit?: number
  } = {}): Promise<{ success: boolean; threads: any[]; pagination: any }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/threads?${searchParams}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch threads')
    }

    return response.json()
  }

  async getThread(id: string): Promise<{ success: boolean; thread: any }> {
    const response = await fetch(`${API_BASE_URL}/threads/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch thread')
    }

    return response.json()
  }

  async voteThread(id: string, type: 'upvote' | 'downvote' | 'remove'): Promise<{ success: boolean; voteScore: number; upvotes: number; downvotes: number }> {
    const response = await fetch(`${API_BASE_URL}/threads/${id}/vote`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ type })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to vote')
    }

    return response.json()
  }

  getFileUrl(filename: string): string {
    return `${API_BASE_URL}/threads/uploads/${filename}`
  }
}

export const apiService = new ApiService()