'use client'

import { useId, useState, type ChangeEvent, type DragEvent } from 'react'
import { Check, FileText, Sparkles, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalysisLevel, SummaryStyle } from '@/lib/schemas'
import { DEFAULT_FOCUS, SAMPLE_DOCUMENTS, type SampleId, type WizardStep } from './types'

const analysisLevels: { value: AnalysisLevel; label: string; description: string }[] = [
  { value: 'basic', label: 'Basic', description: 'A quick profile and top skills.' },
  { value: 'standard', label: 'Standard', description: 'A balanced overview of every resume section.' },
  { value: 'detailed', label: 'Detailed', description: 'Deeper role insights, strengths, and gaps.' },
]

const summaryStyles: { value: SummaryStyle; label: string; description: string }[] = [
  { value: 'brief', label: 'Brief', description: 'A concise 2–3 sentence overview.' },
  { value: 'detailed', label: 'Detailed', description: 'A fuller narrative across paragraphs.' },
  { value: 'bullets', label: 'Bullets', description: 'A scan-friendly list of key points.' },
]

const focusOptions = ['Skills', 'Education', 'Experience', 'Contact'] as const

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StepIndicator({ current }: { current: WizardStep }) {
  const steps = [
    { id: 'upload', label: 'Upload' },
    { id: 'configure', label: 'Configure' },
    { id: 'results', label: 'Results' },
  ] as const
  const active = current === 'upload' ? 0 : current === 'configure' ? 1 : 2

  return (
    <nav aria-label="Analysis progress" className="mb-8">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const complete = index < active
          const currentStep = index === active
          return (
            <li key={step.id} aria-current={currentStep ? 'step' : undefined} className="min-w-0">
              <div className={`flex items-center gap-2 border-t-2 pt-3 text-xs font-medium sm:text-sm ${currentStep ? 'border-primary text-foreground' : complete ? 'border-primary/50 text-foreground' : 'border-border text-muted-foreground'}`}>
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${currentStep ? 'bg-primary text-primary-foreground' : complete ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {complete ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function UploadStep({
  file,
  error,
  onFileSelect,
  onSampleSelect,
  sampleLoading,
}: {
  file: File | null
  error: string | null
  onFileSelect: (file: File | null) => void
  onSampleSelect: (sample: SampleId) => void
  sampleLoading: SampleId | null
}) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.item(0)
    if (nextFile) onFileSelect(nextFile)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.currentTarget.files)
    event.currentTarget.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <p className="eyebrow">Step 1 · Upload</p>
          <CardTitle className="mt-2 text-2xl tracking-tight sm:text-3xl">Start with a resume</CardTitle>
          <p className="max-w-xl text-sm leading-6">Add a PDF or plain text file. The document is processed for this analysis and is never saved to your browser history.</p>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'}`}
          >
            <input
              id={inputId}
              aria-label="Choose a PDF or TXT resume"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="sr-only"
              type="file"
              onChange={handleInputChange}
            />
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload aria-hidden="true" className="size-6" />
            </div>
            <p className="mt-5 text-base font-semibold">{dragging ? 'Drop to add your resume' : 'Drag and drop your resume'}</p>
            <p className="mt-1 text-sm text-muted-foreground">or choose a file from your device</p>
            <label
              htmlFor={inputId}
              className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            >
              <FileText aria-hidden="true" className="size-4" />
              Browse files
            </label>
            <p className="mt-4 text-xs text-muted-foreground">PDF or TXT · Maximum 4 MB</p>
          </div>

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <X aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {file && (
            <div aria-live="polite" className="mt-4 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary"><FileText aria-hidden="true" className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · Ready to analyze</p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove selected file" onClick={() => onFileSelect(null)}>
                <X aria-hidden="true" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="samples" className="h-fit border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Sparkles aria-hidden="true" className="size-5" /></div>
          <CardTitle className="mt-3 text-lg">Try a sample</CardTitle>
          <p className="text-sm leading-6">Explore the analysis flow with a ready-made resume.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={sampleLoading !== null}
              onClick={() => onSampleSelect(sample.id)}
              className="group flex w-full scroll-mb-40 items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FileText aria-hidden="true" className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium group-hover:text-primary">{sample.title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{sample.description}</span>
                <span className="mt-1.5 block text-[11px] font-medium text-primary">{sampleLoading === sample.id ? 'Loading sample…' : sample.detail}</span>
              </span>
            </button>
          ))}
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Samples are public demo content. Your own uploaded file is not stored.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function ConfigureStep({
  level,
  style,
  focus,
  onLevelChange,
  onStyleChange,
  onFocusChange,
}: {
  level: AnalysisLevel
  style: SummaryStyle
  focus: string[]
  onLevelChange: (value: AnalysisLevel) => void
  onStyleChange: (value: SummaryStyle) => void
  onFocusChange: (value: string[]) => void
}) {
  const selectedFocus = focus.length ? focus.join(', ') : 'a balanced review'
  const detailByLevel = {
    basic: 'a concise profile with top skills',
    standard: 'a complete profile, skills, education, and experience',
    detailed: 'a deeper review with role insights, strengths, and gaps',
  }[level]
  const styleCopy = {
    brief: 'in a concise 2–3 sentence summary',
    detailed: 'in a detailed, multi-paragraph summary',
    bullets: 'as a scannable set of key bullets',
  }[style]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="eyebrow">Step 2 · Configure</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Choose your analysis lens</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Tune the depth and areas of emphasis before ResumeLens analyzes your document.</p>
      </div>

      <div className="grid gap-5">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Analysis level</CardTitle>
            <p>How much detail should the analysis include?</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {analysisLevels.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="analysis-level" value={option.value} checked={level === option.value} onChange={() => onLevelChange(option.value)} />
                <span className="block h-full rounded-xl border border-border bg-background p-4 transition peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 hover:border-primary/40">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">{option.label}{level === option.value && <Check aria-hidden="true" className="size-4 text-primary" />}</span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Summary style</CardTitle>
            <p>Choose the format that is easiest for you to review.</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {summaryStyles.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="summary-style" value={option.value} checked={style === option.value} onChange={() => onStyleChange(option.value)} />
                <span className="block h-full rounded-xl border border-border bg-background p-4 transition peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 hover:border-primary/40">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">{option.label}{style === option.value && <Check aria-hidden="true" className="size-4 text-primary" />}</span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Focus areas</CardTitle>
            <p>Select the topics that matter most. Choose none for a balanced review.</p>
          </CardHeader>
          <CardContent>
            <fieldset>
              <legend className="sr-only">Resume analysis focus areas</legend>
              <div className="flex flex-wrap gap-2">
                {focusOptions.map((item) => {
                  const selected = focus.includes(item)
                  return (
                    <label key={item} className="cursor-pointer">
                      <input className="peer sr-only" type="checkbox" checked={selected} onChange={() => onFocusChange(selected ? focus.filter((entry) => entry !== item) : [...focus, item])} />
                      <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 hover:border-primary/40">
                        {selected && <Check aria-hidden="true" className="size-3.5" />}{item}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <div aria-live="polite" className="mt-5 rounded-xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">Your analysis will include </span>{detailByLevel}, focused on {selectedFocus}, {styleCopy}.
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{DEFAULT_FOCUS.length} focus areas are available. Every AI finding is grounded in the document text.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
