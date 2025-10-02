import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase-client'

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setErrorMessage('')

    try {
      // Assuming you have a logged-in user; for now using mock ID
      const userId = '00000000-0000-0000-0000-000000000000' // Replace with Clerk ID in Phase 1

      for (const file of files) {
        // Upload file to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('uploads')
          .upload(`user-files/${file.name}`, file, { upsert: true })

        if (storageError) throw storageError

        // Insert a record into uploads table
        const { data: dbData, error: dbError } = await supabase.from('uploads').insert({
          user_id: userId,
          file_name: file.name,
          file_url: storageData.path,
          status: 'uploaded',
        })

        if (dbError) throw dbError
      }

      navigate('/process') // Proceed to processing/iterations page
    } catch (error: any) {
      console.error('Upload failed:', error)
      setErrorMessage(error.message || 'Upload failed. Please try again.')
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
          {isDragActive ? 'Drop the files here...' : "Drag 'n' drop HTML/CSS/JS files here, or click to select"}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mb-4">
          {files.map((file) => (
            <li key={file.name} className="text-gray-700">
              {file.name} ({Math.round(file.size / 1024)} KB)
            </li>
          ))}
        </ul>
      )}

      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

      <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
        {uploading ? 'Uploading...' : 'Apply WCAG Practices'}
      </Button>
    </div>
  )
}

export default UploadPage

