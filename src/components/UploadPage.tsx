import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([])
  const navigate = useNavigate()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async () => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    for (const file of files) {
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`user-${user.id}/${file.name}`, file)

      if (error) console.error(error)

      await supabase.from('uploads').insert({
        user_id: user.id,
        file_name: file.name,
        file_path: data?.path
      })
    }

    navigate('/process')
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Upload Frontend Files</h2>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-8 rounded-lg mb-6 cursor-pointer">
        <input {...getInputProps()} />
        <p className="text-center text-gray-500">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop HTML/CSS/JS files here, or click to select'}
        </p>
      </div>
      {files.length > 0 && <p className="mb-4">Selected files: {files.map((f) => f.name).join(', ')}</p>}
      <Button onClick={handleSubmit} disabled={files.length === 0}>Apply WCAG Practices</Button>
    </div>
  )
}

export default UploadPage

