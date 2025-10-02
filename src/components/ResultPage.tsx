import ReactDiffViewer from 'react-diff-viewer'
import { Button } from '@/components/ui/button'

// Mock data; Phase 1: fetch from Supabase
const originalCode = `// Original code\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`
const optimizedCode = `// Optimized code with WCAG\n<html lang="en">\n  <body>\n    <h1 aria-label="Greeting">Hello World</h1>\n  </body>\n</html>`

const ResultPage = () => {
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
