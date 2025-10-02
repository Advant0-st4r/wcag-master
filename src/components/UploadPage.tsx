import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/supabase' // your supabase client

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async () => {
    if (files.length === 0) return
    setUploading(true)

    try {
      for (const file of files) {
        // 1. Upload file to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('uploads')
          .upload(`files/${file.name}`, file, { upsert: true })

        if (storageError) throw storageError

        // 2. Insert record in 'uploads' table
        const { data: uploadRow, error: uploadError } = await supabase
          .from('uploads')
          .insert({
            filename: file.name,
            file_url: storageData?.path,
            status: 'pending', // Phase 2 will update to 'processed'
            user_id: supabase.auth.user()?.id // placeholder if auth integrated
          })
          .select()
          .single()

        if (uploadError) throw uploadError

        // 3. Trigger Phase 2 AI processing via Edge Function (mock for now)
        await fetch('/api/process-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id: uploadRow.id })
        })
      }

      navigate('/process')
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Check console for details.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Upload Frontend Files</h2>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-6 cursor-pointer hover:border-gray-500 transition"
      >
        <input {...getInputProps()} />
        <p className="text-center text-gray-500">
          {isDragActive
            ? 'Drop the files here...'
            : "Drag 'n' drop HTML/CSS/JS files here, or click to select"}
        </p>
      </div>
      {files.length > 0 && (
        <p className="mb-4 text-gray-700">Selected files: {files.map((f) => f.name).join(', ')}</p>
      )}
      <Button onClick={handleSubmit} disabled={files.length === 0 || uploading}>
        {uploading ? 'Uploading...' : 'Apply WCAG Practices'}
      </Button>
    </div>
  )
}

export default UploadPage
