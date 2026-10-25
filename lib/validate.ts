import { analysisSchema, type Analysis } from './schemas'
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export type Finding = { field: string; message: string }
export function validateAnalysis(input: unknown, source: string): { data: Analysis; findings: Finding[] } {
  const parsed = analysisSchema.parse(input); const findings: Finding[] = []; const lower = source.toLowerCase()
  if (parsed.email && !emailRe.test(parsed.email)) { parsed.email = null; findings.push({ field: 'email', message: 'Email format is uncertain.' }) }
  if (parsed.name && !lower.includes(parsed.name.toLowerCase())) { parsed.name = null; findings.push({ field: 'name', message: 'Name was not verified in the document.' }) }
  parsed.skills = parsed.skills.filter((skill) => { const ok = lower.includes(skill.toLowerCase()); if (!ok) findings.push({ field: 'skills', message: `${skill} is unverified.` }); return ok })
  return { data: parsed, findings }
}
