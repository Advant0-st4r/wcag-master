// src/components/UploadPage.tsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const nav = useNavigate()

  const onDrop = useCallback((acceptedFiles: File[]) => setFiles(acceptedFiles), [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleSubmit = async () => {
    if (files.length === 0) return
    setUploading(true)

    try {
      // get user (if using supabase auth; otherwise adjust)
      const { data: userResp } = await supabase.auth.getUser()
      const user = userResp?.user
      const userId = user?.id ?? 'anonymous'

      for (const file of files) {
        // upload to storage
        const path = `user-${userId}/${Date.now()}-${file.name}`
        const { data: storageData, error: storageError } = await supabase.storage
          .from('uploads')
          .upload(path, file, { upsert: true })

        if (storageError) {
          console.error('Storage upload error', storageError)
          continue
        }

        // optionally read the file content and save in DB for quick access (Phase1 fallback)
        const text = await file.text()

        const { error: dbError } = await supabase
          .from('uploads')
          .insert([{
            user_id: userId,
            file_name: file.name,
            file_path: storageData.path,
            file_content: text,
            status: 'uploaded'
          }])

        if (dbError) console.error('DB insert error', dbError)
      }

      nav('/process')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-2xl font-semibold mb-6">Upload Frontend Files</h2>

      <div {...getRootProps()} className="border-2 border-dashed p-8 rounded-lg mb-6 text-center">
        <input {...getInputProps()} />
        <p className="text-gray-600">{isDragActive ? 'Drop files here...' : "Drag & drop HTML/CSS/JS files here, or click to select"}</p>
      </div>

      {files.length > 0 && (
        <ul className="mb-4">
          {files.map(f => <li key={f.name} className="text-gray-700">{f.name} — {Math.round(f.size/1024)} KB</li>)}
        </ul>
      )}

      <button onClick={handleSubmit} disabled={files.length === 0 || uploading}
        className="px-5 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
      >
        {uploading ? 'Uploading...' : 'Apply WCAG Practices'}
      </button>
    </div>
  )
}

