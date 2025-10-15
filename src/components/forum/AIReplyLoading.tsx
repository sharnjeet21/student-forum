import { useState, useEffect } from 'react'

interface AIReplyLoadingProps {
  onCancel?: () => void
}

export const AIReplyLoading: React.FC<AIReplyLoadingProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  const steps = [
    { text: 'Analyzing your question', icon: '🔍', duration: 2000 },
    { text: 'Generating helpful response', icon: '🧠', duration: 3000 },
    { text: 'Creating follow-up questions', icon: '💡', duration: 2000 },
    { text: 'Finalizing answer', icon: '✨', duration: 1000 }
  ]

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Progress through steps
  useEffect(() => {
    if (currentStep >= steps.length - 1) return

    const timer = setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, steps[currentStep].duration)

    return () => clearTimeout(timer)
  }, [currentStep, steps])

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-start space-x-4">
        {/* AI Avatar with Animation */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-2xl animate-bounce">🤖</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-blue-900">AI Study Assistant</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">
                Thinking...
              </span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Generating response...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl animate-spin" style={{ animationDuration: '2s' }}>
              {currentStepData.icon}
            </span>
            <span className="text-sm text-blue-700">
              {currentStepData.text}{dots}
            </span>
          </div>

          {/* Animated Dots */}
          <div className="flex space-x-1 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>

          {/* Steps Progress */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <span className={index === currentStep ? 'animate-pulse' : ''}>
                  {step.icon}
                </span>
                <span className="truncate">{step.text}</span>
                {index < currentStep && (
                  <span className="text-green-500 ml-auto">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Fun Fact */}
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-600">
              💡 <strong>Did you know?</strong> I analyze thousands of educational resources to provide you with the most helpful explanations!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}