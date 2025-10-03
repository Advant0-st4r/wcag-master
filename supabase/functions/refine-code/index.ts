// supabase/functions/refine-code/index.ts
import { serve } from '@supabase/functions'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing Supabase env in function.')
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

serve(async (req) => {
  try {
    const { uploadId, feedback } = await req.json()

    if (!uploadId) {
      return new Response(JSON.stringify({ error: 'Missing uploadId' }), { status: 400 })
    }

    // 1) fetch upload record
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (uploadError || !upload) {
      return new Response(JSON.stringify({ error: uploadError?.message || 'Upload not found' }), { status: 404 })
    }

    // 2) fetch file from storage (if present)
    let originalCode = upload.file_content ?? ''
    if (upload.file_path) {
      const { data: fileBlob, error: dlError } = await supabaseAdmin
        .storage
        .from('uploads')
        .download(upload.file_path)

      if (!dlError && fileBlob) {
        try { originalCode = await fileBlob.text() } catch (e) { /* ignore */ }
      }
    }

    // --- Placeholder AI refinement ---
    // Replace this block with a call to your LLM (OpenAI/Claude) using a server-side secret.
    const refinedCode = `${originalCode}\n\n/* Refined after feedback: ${feedback || 'none'} */`

    // 3) persist iteration
    const { error: iterErr } = await supabaseAdmin
      .from('iterations')
      .insert([{
        upload_id: uploadId,
        iteration_number: (upload.iteration_count ?? 0) + 1,
        feedback: feedback ?? '',
        refined_code: refinedCode
      }])

    if (iterErr) {
      return new Response(JSON.stringify({ error: iterErr.message }), { status: 500 })
    }

    // 4) optional: update uploads iteration_count + status
    await supabaseAdmin
      .from('uploads')
      .update({ iteration_count: (upload.iteration_count ?? 0) + 1, status: 'processed' })
      .eq('id', uploadId)

    return new Response(JSON.stringify({ refinedCode }), { status: 200 })
  } catch (err) {
    console.error('Refine-code function error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})

