import OpenAI from 'openai'

// Initialize OpenAI with server-side key (env var)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const prompt = `
You are an expert in WCAG accessibility. 
Optimize the following frontend code to improve accessibility, 
color contrast, semantic HTML, ARIA attributes, and best practices.

User feedback: ${feedback || 'No feedback provided'}

Code:
${uploadData.file_content}
`

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: prompt }]
})

const refinedCode = response.choices[0].message.content

