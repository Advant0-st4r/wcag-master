import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabase'

const ProcessPage = () => {
  const [iteration, setIteration] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [codePreview, setCodePreview] = useState(`// Mock initial optimized code after WCAG application\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`)
  const maxIterations = 3
  const navigate = useNavigate()

  const handleSubmitFeedback = async () => {
    // TODO: Send feedback to Supabase Edge Function for AI refinement
    setCodePreview(`${codePreview}\n// Refined after feedback ${iteration}: Added accessibility improvements`)
    setFeedback('')

    if (iteration < maxIterations) {
      setIteration(iteration + 1)
    } else {
      navigate('/result')
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Refine Optimizations - Iteration {iteration}/{maxIterations}</h2>
      <pre className="bg-white p-4 rounded-lg shadow mb-6 overflow-auto max-h-96">{codePreview}</pre>
      <Textarea 
        value={feedback} 
        onChange={(e) => setFeedback(e.target.value)} 
        placeholder="Provide feedback (e.g., 'Improve mobile accessibility', 'Fix color contrast')" 
        className="mb-6" 
      />
      <Button onClick={handleSubmitFeedback}>Submit Feedback & Refine</Button>
    </div>
  )
}

export default ProcessPage

