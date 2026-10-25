import type { Analysis, AnalysisLevel, SummaryStyle } from '@/lib/schemas'

export type Finding = { field: string; message: string }

export type CompletenessResult = {
  score: number
  missing: string[]
  uncertain: string[]
}

export type AnalysisResponse = {
  data: Analysis
  findings: Finding[]
  completeness: CompletenessResult
  truncated: boolean
  text?: string
}

export type AnalysisOptions = {
  level: AnalysisLevel
  style: SummaryStyle
  focus: string[]
}

export type SavedAnalysis = AnalysisOptions & {
  id: string
  fileName: string
  createdAt: string
  data: Analysis
  findings: Finding[]
  completeness: CompletenessResult
  truncated: boolean
}

export type SampleId = 'strong' | 'sparse' | 'messy'
export type WizardStep = 'upload' | 'configure' | 'loading' | 'results'

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const DEFAULT_FOCUS = ['Skills', 'Education', 'Experience', 'Contact']

export const SAMPLE_DOCUMENTS: {
  id: SampleId
  title: string
  description: string
  detail: string
}[] = [
  {
    id: 'strong',
    title: 'Complete profile',
    description: 'A polished resume with clear impact and a full work history.',
    detail: 'Best for a full analysis',
  },
  {
    id: 'sparse',
    title: 'Sparse resume',
    description: 'A short profile with useful details intentionally left out.',
    detail: 'Explore missing-field insights',
  },
  {
    id: 'messy',
    title: 'Unformatted resume',
    description: 'A realistic text-heavy resume with inconsistent formatting.',
    detail: 'Test extraction resilience',
  },
]
