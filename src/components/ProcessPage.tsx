import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/supabase'

interface Upload {
  id: string
  file_name: string
  status: string
  processed_file_url?: string
  feedbacks?: string[]
}

const ProcessPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const uploadId = location.state?.uploadId as string // Passed from UploadPage

  const [upload, setUpload] = useState<Upload | null>(null)
  const [iteration, setIteration] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [maxIterations] = useState(3)
  const [codePreview, setCodePreview] = useState('// Loading uploaded file...')

  // Fetch upload record on mount
  useEffect(() => {
    const fetchUpload = async () => {
      if (!uploadId) return
      const { data, error } = await supabase
        .from<Upload>('uploads')
        .select('*')
        .eq('id', uploadId)
        .single()
      if (error) console.error(error)
      else setUpload(data)
    }
    fetchUpload()
  }, [uploadId])

  // Mock initial code preview
  useEffect(() => {
    if (upload) {
      setCodePreview(`// Original uploaded file: ${upload.file_name}\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`)
    }
  }, [upload])

  const handleSubmitFeedback = async () => {
    if (!upload) return

    // Append feedback locally
    const newFeedbacks = [...(upload.feedbacks || []), feedback]

    // Update feedbacks in Supabase (mock for Phase 2 AI integration)
    const { error } = await supabase
      .from('uploads')
      .update({ feedbacks: newFeedbacks })
      .eq('id', upload.id)

    if (error) {
      console.error(error)
      return
    }

    // Mock code refinement per iteration
    setCodePreview(prev => `${prev}\n// Refined after feedback ${iteration}: ${feedback}`)
    setFeedback('')

    if (iteration < maxIterations) {
      setIteration(iteration + 1)
    } else {
      navigate('/result', { state: { uploadId: upload.id } })
    }
  }

  if (!upload) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">
        Refine Optimizations - Iteration {iteration}/{maxIterations}
      </h2>

      <pre className="bg-white p-4 rounded-lg shadow mb-6 overflow-auto max-h-96">{codePreview}</pre>

      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Provide feedback (e.g., 'Improve mobile accessibility' or 'Fix color contrast')"
        className="mb-6"
      />

      <Button onClick={handleSubmitFeedback}>Submit Feedback & Refine</Button>
    </div>
  )
}

export default ProcessPage

