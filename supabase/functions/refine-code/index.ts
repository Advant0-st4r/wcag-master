import { serve } from '@supabase/functions'
import { createClient } from '@supabase/supabase-js'

// Admin client using Service Role Key (server-side only)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

serve(async (req) => {
  try {
    // Parse incoming JSON request
    const { uploadId, feedback } = await req.json()

    if (!uploadId) {
      return new Response(
        JSON.stringify({ error: 'Missing uploadId' }),
        { status: 400 }
      )
    }

    // Fetch the uploaded file content from uploads table
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (uploadError || !uploadData) {
      return new Response(
        JSON.stringify({ error: uploadError?.message || 'Upload not found' }),
        { status: 404 }
      )
    }

    // --- Mock AI Refinement ---
    // Replace this with actual LLM API call when integrated
    const originalCode = uploadData.file_content
    const refinedCode = `${originalCode}\n// Refined after feedback: ${feedback || 'No feedback provided'}`

    // Insert iteration record into iterations table
    const { error: iterationError } = await supabaseAdmin
      .from('iterations')
      .insert([{
        upload_id: uploadId,
        feedback: feedback || '',
        refined_code: refinedCode
      }])

    if (iterationError) {
      return new Response(
        JSON.stringify({ error: iterationError.message }),
        { status: 500 }
      )
    }

    // Return the refined code
    return new Response(
      JSON.stringify({ refinedCode }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (err) {
    console.error('Error in refine-code function:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500 }
    )
  }
})



