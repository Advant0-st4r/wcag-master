import ReactDiffViewer from 'react-diff-viewer'
import { Button } from '@/components/ui/button'
import { supabase } from '../supabase'
import { useEffect, useState } from 'react'

const ResultPage = () => {
  const [originalCode, setOriginalCode] = useState('')
  const [optimizedCode, setOptimizedCode] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: uploads } = await supabase.from('uploads').select('*').limit(1)
      if (!uploads || uploads.length === 0) return
      setOriginalCode(uploads[0].file_content)

      const { data: iterations } = await supabase
        .from('iterations')
        .select('*')
        .eq('upload_id', uploads[0].id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (iterations && iterations.length > 0) {
        setOptimizedCode(iterations[0].refined_code)
      }
    }

    fetchData()
  }, [])

  const handleDownload = () => {
    const blob = new Blob([optimizedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized.html'
    a.click()
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Optimized Code Preview</h2>
      <ReactDiffViewer oldValue={originalCode} newValue={optimizedCode} splitView={true} showDiffOnly={false} />
      <Button onClick={handleDownload} className="mt-6">Download Optimized Files</Button>
    </div>
  )
}

export default ResultPage


