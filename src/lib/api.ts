export async function refineCode(uploadId: string, feedback: string) {
  const res = await fetch('/functions/refine-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, feedback }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Unknown error refining code')
  }

  const data = await res.json()
  return data.refinedCode
}
