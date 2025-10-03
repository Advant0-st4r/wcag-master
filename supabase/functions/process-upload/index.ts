import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const { uploadId } = await req.json()
    if (!uploadId) return new Response(JSON.stringify({ error: 'Missing uploadId' }), { status: 400 })

    // Fetch the uploaded file
    const { data: upload, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single()
    if (error || !upload) return new Response(JSON.stringify({ error: error?.message || 'Upload not found' }), { status: 404 })

    // Mock processing: create initial optimized code placeholder
    const initialCode = `// Initial WCAG processing for ${upload.file_name}\n<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`

    // Insert iteration record
    const { data: iteration, error: iterationError } = await supabase
      .from('iterations')
      .insert([{ upload_id: uploadId, iteration_number: 1, code_snapshot: initialCode }])
      .select()
      .single()
    if (iterationError) return new Response(JSON.stringify({ error: iterationError.message }), { status: 500 })

    return new Response(JSON.stringify({ success: true, initialCode }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
