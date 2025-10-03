import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const { uploadId, iterationNumber, feedback } = await req.json()
    if (!uploadId || !iterationNumber || !feedback) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    // Fetch latest code snapshot
    const { data: iterationData, error: fetchError } = await supabase
      .from('iterations')
      .select('*')
      .eq('upload_id', uploadId)
      .eq('iteration_number', iterationNumber)
      .single()
    if (fetchError || !iterationData) return new Response(JSON.stringify({ error: fetchError?.message || 'Iteration not found' }), { status: 404 })

    const previousCode = iterationData.code_snapshot

    // Mock refinement: append feedback
    const refinedCode = `${previousCode}\n// Refined after feedback: ${feedback}`

    // Insert next iteration
    const { data: newIteration, error: insertError } = await supabase
      .from('iterations')
      .insert([{ upload_id: uploadId, iteration_number: iterationNumber + 1, code_snapshot: refinedCode }])
      .select()
      .single()
    if (insertError) return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })

    // Update uploads table with latest code URL placeholder (Phase 2: Supabase Storage URL)
    await supabase.from('uploads').update({ processed_file_url: null }).eq('id', uploadId)

    return new Response(JSON.stringify({ success: true, refinedCode }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
