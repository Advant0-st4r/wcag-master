// src/components/ProcessPage.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function ProcessPage() {
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [iteration, setIteration] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [preview, setPreview] = useState('// No preview yet')
  const navigate = useNavigate()
  const maxIterations = 3

  useEffect(() => {
    const loadLatestUpload = async () => {
      const { data, error } = await supabase.from('uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error(error)
        return
      }
      if (data) {
        setUploadId(data.id)
        setPreview(data.file_content ?? `// Uploaded file: ${data.file_name}`)
      }
    }
    loadLatestUpload()
  }, [])

  const handleRefine = async () => {
    if (!uploadId) return

    // invoke Supabase Edge Function via supabase client
    const res = await supabase.functions.invoke('refine-code', {
      body: JSON.stringify({ uploadId, feedback })
    })

    if (!res) {
      console.error('No response from function')
      return
    }

    // supabase.functions.invoke returns a Fetch Response-like object
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      setPreview(json.refinedCode ?? json.refined_code ?? preview)
    } catch {
      setPreview(text)
    }

    setFeedback('')
    if (iteration < maxIterations) setIteration(prev => prev + 1)
    else navigate('/result')
  }

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-2xl font-semibold mb-4">Refine Optimizations — Iteration {iteration}/{maxIterations}</h2>

      <pre className="bg-white p-4 rounded shadow max-h-80 overflow-auto mb-4">{preview}</pre>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Provide feedback (e.g., 'Improve mobile accessibility')"
        className="w-full p-3 border rounded mb-4 min-h-[120px]"
      />

      <div className="flex gap-3">
        <button onClick={handleRefine} className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit Feedback & Refine
        </button>
      </div>
    </div>
  )
}

