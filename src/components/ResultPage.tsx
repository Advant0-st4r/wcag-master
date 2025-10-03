import ReactDiffViewer from 'react-diff-viewer'
import { Button } from '@/components/ui/button'
import { supabase } from '../../supabase'
import { useEffect, useState } from 'react'

const ResultPage = () => {
  const [originalCode, setOriginalCode] = useState('')
  const [optimizedCode, setOptimizedCode] = useState('')

  useEffect(() => {
    const fetchCodes = async () => {
      const user = (await supabase.auth.getUser()).data.user
      const { data: upload } = await supabase.from('uploads').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1).single()
      if (!upload) return

      const { data: fileBlob } = await supabase.storage.from('uploads').download(upload.file_path)
      const original = await fileBlob.text()
      setOriginalCode(original)

      const { data: iteration } = await supabase.from('iterations').select('refined_code').eq('upload_id', upload.id).order('created_at', { ascending: false }).limit(1).single()
      setOptimizedCode(iteration?.refined_code || '')
    }
    fetchCodes()
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


