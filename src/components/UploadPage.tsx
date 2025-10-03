import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([])
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async () => {
    for (const file of files) {
      const { data: uploadData, error: storageError } = await supabase.storage
        .from('uploads')
        .upload(file.name, file)

      if (storageError) {
        console.error('Upload error:', storageError)
        continue
      }

      const fileContent = await file.text() // Read locally for iteration
      const { error: dbError } = await supabase
        .from('uploads')
        .insert([{ file_name: file.name, file_content: fileContent, storage_path: uploadData.path }])

      if (dbError) {
        console.error('DB insert error:', dbError)
      }
    }

    navigate('/process')
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Upload Frontend Files</h2>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-6 cursor-pointer">
        <input {...getInputProps()} />
        <p className="text-center text-gray-500">
          {isDragActive ? 'Drop the files here...' : 'Drag \'n\' drop HTML/CSS/JS files here, or click to select'}
        </p>
      </div>
      {files.length > 0 && (
        <p className="mb-4">Selected files: {files.map((f) => f.name).join(', ')}</p>
      )}
      <Button onClick={handleSubmit} disabled={files.length === 0}>Apply WCAG Practices</Button>
    </div>
  )
}

export default UploadPage

