import type { Analysis, AnalysisLevel, SummaryStyle } from '@/lib/schemas'
import type { AnalysisOptions, CompletenessResult, Finding, SavedAnalysis } from './types'

const HISTORY_KEY = 'resumelens-history'
const OPTIONS_KEY = 'resumelens-options'
const HISTORY_LIMIT = 20

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAnalysis(value: unknown): value is Analysis {
  if (!isRecord(value)) return false
  return (
    typeof value.summary === 'string' &&
    (typeof value.name === 'string' || value.name === null) &&
    (typeof value.email === 'string' || value.email === null) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.education) &&
    Array.isArray(value.experience)
  )
}

function normalizeEntry(value: unknown): SavedAnalysis | null {
  if (!isRecord(value)) return null
  const nestedResult = isRecord(value.result) ? value.result : null
  const data = value.data ?? nestedResult?.data
  const completeness = value.completeness ?? nestedResult?.completeness
  if (!isAnalysis(data) || !isRecord(completeness) || typeof completeness.score !== 'number') return null

  const createdAt = value.createdAt ?? value.timestamp
  const findings = value.findings ?? nestedResult?.findings
  const optionsValue = isRecord(value.options) ? value.options : value
  const level = optionsValue.level
  const style = optionsValue.style
  const focus = optionsValue.focus

  return {
    id: typeof value.id === 'string' ? value.id : `legacy-${String(createdAt ?? Date.now())}`,
    fileName: typeof value.fileName === 'string' ? value.fileName : 'Resume analysis',
    createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
    data,
    findings: Array.isArray(findings)
      ? findings.filter(
          (finding): finding is Finding =>
            isRecord(finding) && typeof finding.field === 'string' && typeof finding.message === 'string',
        )
      : [],
    completeness: {
      score: Math.max(0, Math.min(100, Math.round(completeness.score))),
      missing: Array.isArray(completeness.missing)
        ? completeness.missing.filter((item): item is string => typeof item === 'string')
        : [],
      uncertain: Array.isArray(completeness.uncertain)
        ? completeness.uncertain.filter((item): item is string => typeof item === 'string')
        : [],
    },
    truncated: value.truncated === true || nestedResult?.truncated === true,
    level: level === 'basic' || level === 'detailed' ? level : 'standard',
    style: style === 'detailed' || style === 'bullets' ? style : 'brief',
    focus: Array.isArray(focus)
      ? focus.filter((item): item is string => typeof item === 'string')
      : ['Skills', 'Education', 'Experience', 'Contact'],
  }
}

export function readHistory(): SavedAnalysis[] {
  if (typeof window === 'undefined') return []
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(value)
      ? value.map(normalizeEntry).filter((entry): entry is SavedAnalysis => entry !== null).slice(0, HISTORY_LIMIT)
      : []
  } catch {
    return []
  }
}

export function addHistoryEntry(
  entry: Omit<SavedAnalysis, 'id' | 'createdAt'> & { createdAt?: string },
): SavedAnalysis | null {
  if (typeof window === 'undefined') return null
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const saved: SavedAnalysis = { ...entry, id, createdAt: entry.createdAt ?? new Date().toISOString() }

  try {
    const next = [saved, ...readHistory()].slice(0, HISTORY_LIMIT)
    // Only validated structured results and display metadata are stored; source text and files stay out of history.
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    return saved
  } catch {
    return null
  }
}

export function getHistoryEntry(id: string): SavedAnalysis | null {
  return readHistory().find((entry) => entry.id === id) ?? null
}

export function removeHistoryEntry(id: string): SavedAnalysis[] {
  if (typeof window === 'undefined') return []
  const next = readHistory().filter((entry) => entry.id !== id)
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    return readHistory()
  }
  return next
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(HISTORY_KEY)
  } catch {
    // Storage can be unavailable in private browsing; the UI still clears its in-memory state.
  }
}

export function readAnalysisOptions(): AnalysisOptions | null {
  if (typeof window === 'undefined') return null
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(OPTIONS_KEY) || 'null')
    if (!isRecord(value)) return null
    const level: AnalysisLevel = value.level === 'basic' || value.level === 'detailed' ? value.level : 'standard'
    const style: SummaryStyle = value.style === 'detailed' || value.style === 'bullets' ? value.style : 'brief'
    const focus = Array.isArray(value.focus)
      ? value.focus.filter((item): item is string => typeof item === 'string')
      : ['Skills', 'Education', 'Experience', 'Contact']
    return { level, style, focus }
  } catch {
    return null
  }
}

export function saveAnalysisOptions(options: AnalysisOptions): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(OPTIONS_KEY, JSON.stringify(options))
  } catch {
    // The analyzer remains usable when browser storage is disabled.
  }
}
