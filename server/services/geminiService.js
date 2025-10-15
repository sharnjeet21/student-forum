const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  }

  async generateAnswer(question, category, context = '') {
    try {
      const prompt = this.buildPrompt(question, category, context)
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return {
        success: true,
        answer: text,
        confidence: this.calculateConfidence(text, category)
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      return {
        success: false,
        error: error.message,
        answer: null
      }
    }
  }

  buildPrompt(question, category, context) {
    const categoryPrompts = {
      general: 'You are a helpful student assistant. Provide a clear, informative answer to this general question.',
      homework: 'You are a homework tutor. Help the student understand the concept and guide them toward the solution without giving direct answers. Encourage learning.',
      programming: 'You are a programming mentor. Provide code examples, explain concepts, and suggest best practices. Include debugging tips if relevant.',
      math: 'You are a math tutor. Break down the problem step by step, explain the mathematical concepts, and show the solution process clearly.',
      science: 'You are a science teacher. Explain scientific concepts clearly, provide examples, and relate to real-world applications when possible.',
      literature: 'You are a literature teacher. Analyze themes, characters, and literary devices. Provide context and encourage critical thinking.'
    }

    const basePrompt = categoryPrompts[category] || categoryPrompts.general
    
    let prompt = `${basePrompt}

Question: ${question}

${context ? `Additional Context: ${context}` : ''}

Please provide a helpful, educational response that:
1. Directly addresses the question
2. Is appropriate for students
3. Encourages learning and understanding
4. Is well-structured and easy to read
5. Includes examples when helpful

Keep your response concise but comprehensive (aim for 200-500 words).`

    return prompt
  }

  calculateConfidence(answer, category) {
    // Simple confidence calculation based on answer length and category
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

  async generateFollowUpQuestions(originalQuestion, answer, category) {
    try {
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
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(q => q.length > 10)
      
      return questions.slice(0, 3) // Limit to 3 questions
    } catch (error) {
      console.error('Error generating follow-up questions:', error)
      return []
    }
  }
}

module.exports = new GeminiService()