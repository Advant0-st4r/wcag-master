import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const ProcessPage = () => {
  const [iteration, setIteration] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [codePreview, setCodePreview] = useState('')
  const maxIterations = 3
  const navigate = useNavigate()

  const handleSubmitFeedback = async () => {
    // For simplicity, take first upload
    const { data: uploads } = await supabase.from('uploads').select('*').limit(1)
    if (!uploads || uploads.length === 0) return

    const uploadId = uploads[0].id

    const response = await fetch('/.netlify/functions/refine-code', {
      method: 'POST',
      body: JSON.stringify({ uploadId, feedback }),
    })

    const result = await response.json()
    if (result.refinedCode) {
      setCodePreview(result.refinedCode)
      setFeedback('')
      if (iteration < maxIterations) {
        setIteration(iteration + 1)
      } else {
        navigate('/result')
      }
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Refine Optimizations - Iteration {iteration}/{maxIterations}</h2>
      <pre className="bg-white p-4 rounded-lg shadow mb-6 overflow-auto max-h-96">{codePreview}</pre>
      <Textarea 
        value={feedback} 
        onChange={(e) => setFeedback(e.target.value)} 
        placeholder="Provide feedback" 
        className="mb-6" 
      />
      <Button onClick={handleSubmitFeedback}>Submit Feedback & Refine</Button>
    </div>
  )
}

export default ProcessPage


