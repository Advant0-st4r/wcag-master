import { serve } from '@supabase/functions'
import { supabaseAdmin } from '../../../supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

serve(async (req) => {
  try {
    const { uploadId, feedback } = await req.json()
    if (!uploadId) return new Response(JSON.stringify({ error: 'Missing uploadId' }), { status: 400 })

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (uploadError || !uploadData) {
      return new Response(JSON.stringify({ error: uploadError?.message || 'Upload not found' }), { status: 404 })
    }

    // Fetch the file from Supabase Storage
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from('uploads')
      .download(uploadData.file_path)

    if (downloadError || !fileBlob) {
      return new Response(JSON.stringify({ error: downloadError?.message || 'File not found in storage' }), { status: 404 })
    }

    const originalCode = await fileBlob.text()

    // AI refinement
    const prompt = `
You are an expert in WCAG accessibility.
Optimize the following frontend code for accessibility, semantic HTML, ARIA attributes, color contrast, and best practices.

User feedback: ${feedback || 'No feedback provided'}

Code:
${originalCode}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })

    const refinedCode = response.choices[0].message.content

    // Store iteration
    const { error: iterationError } = await supabaseAdmin
      .from('iterations')
      .insert([{ upload_id: uploadId, feedback: feedback || '', refined_code: refinedCode }])

    if (iterationError) {
      return new Response(JSON.stringify({ error: iterationError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ refinedCode }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Error in refine-code function:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
  }
})

