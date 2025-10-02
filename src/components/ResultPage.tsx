import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ReactDiffViewer from 'react-diff-viewer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/supabase'

interface Upload {
  id: string
  file_name: string
  feedbacks?: string[]
  processed_file_url?: string
}

const ResultPage = () => {
  const location = useLocation()
  const uploadId = location.state?.uploadId as string

  const [upload, setUpload] = useState<Upload | null>(null)
  const [originalCode, setOriginalCode] = useState('// Loading original code...')
  const [optimizedCode, setOptimizedCode] = useState('// Loading optimized code...')

  useEffect(() => {
    const fetchUpload = async () => {
      if (!uploadId) return
      const { data, error } = await supabase
        .from<Upload>('uploads')
        .select('*')
        .eq('id', uploadId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setUpload(data)

      // Mock fetch: For now, original code is first iteration or placeholder
      setOriginalCode(`// Original uploaded file: ${data.file_name}\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`)

      // Mock optimized code: concatenate feedbacks
      const optimized = data.feedbacks?.reduce(
        (acc, fb, idx) => `${acc}\n// Refined after feedback ${idx + 1}: ${fb}`,
        `// Optimized version of ${data.file_name}`
      ) || `// Optimized version of ${data.file_name}`
      setOptimizedCode(optimized)
    }

    fetchUpload()
  }, [uploadId])

  const handleDownload = () => {
    if (!upload) return

    const blob = new Blob([optimizedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `optimized_${upload.file_name}`
    a.click()
  }

  if (!upload) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Optimized Code Preview</h2>

      <ReactDiffViewer
        oldValue={originalCode}
        newValue={optimizedCode}
        splitView={true}
        showDiffOnly={false}
      />

      <Button onClick={handleDownload} className="mt-6">Download Optimized Files</Button>
    </div>
  )
}

export default ResultPage

