// src/components/ResultPage.tsx
import { useEffect, useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer'
import { supabase } from '../supabase'

export default function ResultPage() {
  const [original, setOriginal] = useState('// loading original')
  const [optimized, setOptimized] = useState('// loading optimized')

  useEffect(() => {
    const fetch = async () => {
      const { data: upload } = await supabase.from('uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!upload) return
      try {
        const { data: blobData } = await supabase.storage.from('uploads').download(upload.file_path)
        const originalText = await blobData.text()
        setOriginal(originalText)
      } catch (err) {
        // fallback to saved content
        setOriginal(upload.file_content ?? `// original ${upload.file_name}`)
      }

      const { data: iteration } = await supabase.from('iterations')
        .select('refined_code')
        .eq('upload_id', upload.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setOptimized(iteration?.refined_code ?? '// no optimized version yet')
    }

    fetch()
  }, [])

  const downloadOptimized = () => {
    const blob = new Blob([optimized], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized.html'
    a.click()
  }

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-2xl font-semibold mb-6">Optimized Code Preview</h2>

      <ReactDiffViewer oldValue={original} newValue={optimized} splitView={true} showDiffOnly={false} />

      <button onClick={downloadOptimized} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        Download Optimized Files
      </button>
    </div>
  )
}


