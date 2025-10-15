import { GoogleGenerativeAI } from '@google/generative-ai'

class AIService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    
    if (!apiKey) {
      console.warn('Gemini API key not found. AI features will be disabled.')
      return
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    } catch (error) {
      console.error('Failed to initialize AI Service:', error)
      this.genAI = null
      this.model = null
    }
  }

  async generateAnswer(question: string, category: string, context = ''): Promise<{
    success: boolean
    answer?: string
    confidence?: number
    error?: string
  }> {
    try {
      if (!this.model) {
        return { success: false, error: 'AI service not initialized' }
      }

      const prompt = this.buildPrompt(question, category, context)
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return {
        success: true,
        answer: text,
        confidence: this.calculateConfidence(text, category)
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  private buildPrompt(question: string, category: string, context: string): string {
    const categoryPrompts: Record<string, string> = {
      general: 'You are a helpful student assistant. Provide a clear, informative answer to this general question.',
      homework: 'You are a homework tutor. Help the student understand the concept and guide them toward the solution without giving direct answers. Encourage learning.',
      programming: 'You are a programming mentor. Provide code examples, explain concepts, and suggest best practices. Include debugging tips if relevant.',
      math: 'You are a math tutor. Break down the problem step by step, explain the mathematical concepts, and show the solution process clearly.',
      science: 'You are a science teacher. Explain scientific concepts clearly, provide examples, and relate to real-world applications when possible.',
      literature: 'You are a literature teacher. Analyze themes, characters, and literary devices. Provide context and encourage critical thinking.'
    }

    const basePrompt = categoryPrompts[category] || categoryPrompts.general
    
    return `${basePrompt}

Question: ${question}

${context ? `Additional Context: ${context}` : ''}

Please provide a helpful, educational response that:
1. Directly addresses the question
2. Is appropriate for students
3. Encourages learning and understanding
4. Is well-structured and easy to read
5. Includes examples when helpful

Keep your response concise but comprehensive (aim for 200-500 words).`
  }

  private calculateConfidence(answer: string, category: string): number {
    const length = answer.length
    const hasExamples = answer.includes('example') || answer.includes('for instance')
    const hasSteps = answer.includes('step') || answer.includes('first') || answer.includes('then')
    
    let confidence = 0.7 // Base confidence
    
    if (length > 100) confidence += 0.1
    if (length > 300) confidence += 0.1
    if (hasExamples) confidence += 0.05
    if (hasSteps) confidence += 0.05
    
    // Category-specific adjustments
    if (['math', 'programming', 'science'].includes(category)) {
      if (hasSteps) confidence += 0.1
    }
    
    return Math.min(confidence, 0.95) // Cap at 95%
  }

  async generateFollowUpQuestions(originalQuestion: string, answer: string, category: string): Promise<string[]> {
    try {
      if (!this.model) return []

      const prompt = `Based on this question and answer, suggest 2-3 short follow-up questions (max 150 characters each) that would help the student learn more:

Original Question: ${originalQuestion}
Answer: ${answer}
Category: ${category}

Generate concise follow-up questions that:
1. Deepen understanding of the topic
2. Explore related concepts
3. Encourage practical application

Keep each question under 150 characters. Format as a simple numbered list.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the response into an array of questions
      const questions = text.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.?\s*/, '').trim())
        .filter((q: string) => q.length > 10 && q.length <= 150)
      
      return questions.slice(0, 3) // Limit to 3 questions
    } catch (error) {
      return []
    }
  }
}

export const aiService = new AIService()