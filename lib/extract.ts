import { extractText, getDocumentProxy } from 'unpdf'
export const MAX_FILE_BYTES = 4 * 1024 * 1024
export const MAX_CHARS = 30000
export async function extractResumeText(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error('FILE_TOO_LARGE')
  const type = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/plain')
  if (!type.includes('pdf') && !type.includes('text')) throw new Error('UNSUPPORTED_TYPE')
  const raw = type.includes('pdf') ? await extractPdf(file) : await file.text()
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) throw new Error(type.includes('pdf') ? 'SCANNED_PDF' : 'EMPTY_FILE')
  if (text.length < 100) throw new Error('TOO_SHORT')
  return { text: text.slice(0, MAX_CHARS), truncated: text.length > MAX_CHARS }
}
async function extractPdf(file: File) {
  try { const buffer = await file.arrayBuffer(); const pdf = await getDocumentProxy(new Uint8Array(buffer)); const { text } = await extractText(pdf, { mergePages: true }); return text }
  catch { throw new Error('CORRUPT_PDF') }
}
