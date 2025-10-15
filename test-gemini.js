require('dotenv').config({ path: './server/.env' })
const geminiService = require('./server/services/geminiService')

async function testGemini() {
  console.log('🧪 Testing Gemini API...')
  console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing')
  
  try {
    const response = await geminiService.generateAnswer(
      'How do I solve quadratic equations?',
      'math',
      'This is a test question'
    )
    
    console.log('✅ Response:', response)
    
    if (response.success) {
      console.log('📝 Answer:', response.answer.substring(0, 200) + '...')
      console.log('🎯 Confidence:', response.confidence)
      
      // Test follow-up questions
      const followUp = await geminiService.generateFollowUpQuestions(
        'How do I solve quadratic equations?',
        response.answer,
        'math'
      )
      
      console.log('💡 Follow-up questions:', followUp)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testGemini()