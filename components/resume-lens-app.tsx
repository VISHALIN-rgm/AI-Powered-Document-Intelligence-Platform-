'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Clock3, FileWarning, RefreshCw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { AnalysisLevel, SummaryStyle } from '@/lib/schemas'
import { addHistoryEntry, getHistoryEntry, readAnalysisOptions, saveAnalysisOptions } from '@/components/analyzer/history-store'
import { AnalysisLoading } from '@/components/analyzer/analysis-loading'
import { ResultsDashboard } from '@/components/analyzer/results-dashboard'
import { ConfigureStep, StepIndicator, UploadStep } from '@/components/analyzer/wizard-steps'
import { DEFAULT_FOCUS, MAX_UPLOAD_BYTES, type AnalysisOptions, type AnalysisResponse, type SampleId, type WizardStep } from '@/components/analyzer/types'

type ErrorKind = 'unsupported' | 'too-large' | 'empty' | 'scanned' | 'corrupt' | 'short' | 'rate-limit' | 'timeout' | 'not-configured' | 'server'
type AnalysisError = { kind: ErrorKind; message: string }

const defaults: AnalysisOptions = { level: 'standard', style: 'brief', focus: DEFAULT_FOCUS }

function validateFile(file: File): string | null {
  if (file.size === 0) return 'This file is empty. Choose a PDF or TXT resume with content.'
  if (file.size > MAX_UPLOAD_BYTES) return 'This file is larger than 4 MB. Choose a smaller resume.'
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension !== 'pdf' && extension !== 'txt') return 'ResumeLens supports PDF and plain text (.txt) files only.'
  return null
}

function classifyError(message: string): ErrorKind {
  const normalized = message.toLowerCase()
  if (normalized.includes('4 mb') || normalized.includes('larger')) return 'too-large'
  if (normalized.includes('scanned') || normalized.includes('text-based') || normalized.includes('selectable text')) return 'scanned'
  if (normalized.includes('corrupt') || normalized.includes('could not read this pdf')) return 'corrupt'
  if (normalized.includes('too short') || normalized.includes('100 characters')) return 'short'
  if (normalized.includes('empty')) return 'empty'
  if (normalized.includes('pdf or plain text') || normalized.includes('unsupported')) return 'unsupported'
  if (normalized.includes('rate-limit') || normalized.includes('rate limit') || normalized.includes('busy') || normalized.includes('quota') || normalized.includes('429')) return 'rate-limit'
  if (normalized.includes('timeout') || normalized.includes('timed out')) return 'timeout'
  if (normalized.includes('not configured') || normalized.includes('api key')) return 'not-configured'
  return 'server'
}

function friendlyError(kind: ErrorKind): { title: string; description: string; action: string; icon: typeof AlertTriangle } {
  const messages: Record<ErrorKind, { title: string; description: string; action: string; icon: typeof AlertTriangle }> = {
    unsupported: { title: 'That file type is not supported', description: 'Choose a PDF or plain text file ending in .txt.', action: 'Choose another file', icon: FileWarning },
    'too-large': { title: 'This resume is over the size limit', description: 'The maximum upload size is 4 MB. Choose a smaller file and try again.', action: 'Choose a smaller file', icon: FileWarning },
    empty: { title: 'This file has no content', description: 'Choose a non-empty PDF or TXT resume to continue.', action: 'Choose another file', icon: FileWarning },
    scanned: { title: 'This PDF looks like a scan', description: 'ResumeLens reads selectable text and does not run OCR. Export a text-based PDF or choose a TXT file.', action: 'Upload a text-based file', icon: FileWarning },
    corrupt: { title: 'We could not read this PDF', description: 'The document may be damaged or password protected. Export it again or try a plain text file.', action: 'Upload another file', icon: FileWarning },
    short: { title: 'There is not enough resume text', description: 'Add more content or try a complete resume. At least 100 characters are needed for analysis.', action: 'Choose another file', icon: FileWarning },
    'rate-limit': { title: 'The AI service is busy', description: 'Your document is safe. Wait for the countdown, then retry the analysis.', action: 'Retry analysis', icon: Clock3 },
    timeout: { title: 'The analysis took too long', description: 'The request timed out before a result was returned. Please retry in a moment.', action: 'Retry analysis', icon: Clock3 },
    'not-configured': { title: 'AI analysis is not configured', description: 'The deployment is missing its Gemini configuration. An administrator can add the server-side GEMINI_API_KEY.', action: 'Try a sample', icon: AlertTriangle },
    server: { title: 'We could not finish this analysis', description: 'The service returned an unexpected response. Your file has not been saved. Try again or use a sample resume.', action: 'Retry analysis', icon: AlertTriangle },
  }
  return messages[kind]
}

function ErrorCard({
  error,
  countdown,
  onRetry,
  onUpload,
  onSample,
}: {
  error: AnalysisError
  countdown: number
  onRetry: () => void
  onUpload: () => void
  onSample: () => void
}) {
  const copy = friendlyError(error.kind)
  const Icon = copy.icon
  const fileIssue = ['unsupported', 'too-large', 'empty', 'scanned', 'corrupt', 'short'].includes(error.kind)
  const configurationIssue = error.kind === 'not-configured'

  return (
    <Card role="alert" className="mb-5 border-destructive/25 bg-destructive/[0.025] shadow-none">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Icon aria-hidden="true" className="size-5" /></span>
          <div><h2 className="text-sm font-semibold">{copy.title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.description}</p></div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {!fileIssue && !configurationIssue ? <Button onClick={onRetry} disabled={countdown > 0}><RefreshCw data-icon="inline-start" />{countdown > 0 ? `Retry in ${countdown}s` : copy.action}</Button> : null}
          {configurationIssue ? <Button variant="outline" onClick={onSample}>Try a sample</Button> : null}
          <Button variant="outline" onClick={onUpload}>{fileIssue ? copy.action : 'Choose another file'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResumeLensApp() {
  const [step, setStep] = useState<WizardStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null)
  const [sampleLoading, setSampleLoading] = useState<SampleId | null>(null)
  const [level, setLevel] = useState<AnalysisLevel>(defaults.level)
  const [style, setStyle] = useState<SummaryStyle>(defaults.style)
  const [focus, setFocus] = useState<string[]>(defaults.focus)
  const [optionsReady, setOptionsReady] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [resultFileName, setResultFileName] = useState('')
  const [resultCreatedAt, setResultCreatedAt] = useState('')
  const [loadingPhase, setLoadingPhase] = useState(0)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const controllerRef = useRef<AbortController | null>(null)
  const timersRef = useRef<number[]>([])
  const timedOutRef = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const hasMountedRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const options = useMemo<AnalysisOptions>(() => ({ level, style, focus }), [level, style, focus])

  useEffect(() => {
    const savedOptions = readAnalysisOptions()
    if (savedOptions) {
      setLevel(savedOptions.level)
      setStyle(savedOptions.style)
      setFocus(savedOptions.focus)
    }
    setOptionsReady(true)

    const historyId = new URLSearchParams(window.location.search).get('history')
    if (historyId) {
      const saved = getHistoryEntry(historyId)
      if (saved) {
        setResult({ data: saved.data, findings: saved.findings, completeness: saved.completeness, truncated: saved.truncated })
        setResultFileName(saved.fileName)
        setResultCreatedAt(saved.createdAt)
        setLevel(saved.level)
        setStyle(saved.style)
        setFocus(saved.focus)
        setStep('results')
      } else {
        toast.error('That saved analysis is no longer available in this browser.')
      }
    }
  }, [])

  useEffect(() => {
    if (optionsReady) saveAnalysisOptions(options)
  }, [options, optionsReady])

  useEffect(() => {
    if (analysisError?.kind !== 'rate-limit') {
      setRetryCountdown(0)
      return
    }
    setRetryCountdown(30)
    const interval = window.setInterval(() => setRetryCountdown((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(interval)
  }, [analysisError])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    headingRef.current?.focus({ preventScroll: false })
  }, [step])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }, [])

  useEffect(() => () => {
    clearTimers()
    controllerRef.current?.abort()
  }, [clearTimers])

  const selectFile = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setFileError(null)
      setAnalysisError(null)
      return
    }
    const validationError = validateFile(nextFile)
    if (validationError) {
      setFile(null)
      setFileError(validationError)
      setAnalysisError(null)
      return
    }
    setFile(nextFile)
    setFileError(null)
    setAnalysisError(null)
  }

  const chooseSample = async (sample: SampleId) => {
    setSampleLoading(sample)
    setFileError(null)
    setAnalysisError(null)
    try {
      const response = await fetch(`/samples/${sample}.txt`)
      if (!response.ok) throw new Error('The sample could not be loaded.')
      const content = await response.text()
      const sampleFile = new File([content], `${sample}-sample-resume.txt`, { type: 'text/plain' })
      selectFile(sampleFile)
      toast.success('Sample resume loaded. Choose your analysis settings next.')
    } catch {
      toast.error('Could not load the sample resume. Please try again.')
    } finally {
      setSampleLoading(null)
    }
  }

  const beginAnalysis = async () => {
    if (!file) {
      setFileError('Choose a PDF or TXT resume before continuing.')
      setStep('upload')
      return
    }
    setAnalysisError(null)
    setLoadingPhase(0)
    timedOutRef.current = false
    clearTimers()
    const controller = new AbortController()
    controllerRef.current = controller
    setStep('loading')

    timersRef.current = [
      window.setTimeout(() => setLoadingPhase(1), 1200),
      window.setTimeout(() => { timedOutRef.current = true; controller.abort() }, 115000),
    ]

    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('level', options.level)
      formData.set('style', options.style)
      formData.set('focus', options.focus.join(','))
      const response = await fetch('/api/analyze', { method: 'POST', body: formData, signal: controller.signal })
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Something went wrong while analyzing this file.'
        throw new Error(message)
      }
      if (typeof payload !== 'object' || payload === null || !('data' in payload) || !('completeness' in payload)) {
        throw new Error('The analysis service returned an incomplete response.')
      }
      const analysis = payload as AnalysisResponse
      const createdAt = new Date().toISOString()
      setLoadingPhase(2)
      setResult(analysis)
      setResultFileName(file.name)
      setResultCreatedAt(createdAt)
      setStep('results')
      const saved = addHistoryEntry({
        fileName: file.name,
        level: options.level,
        style: options.style,
        focus: options.focus,
        data: analysis.data,
        findings: analysis.findings ?? [],
        completeness: analysis.completeness,
        truncated: analysis.truncated === true,
        createdAt,
      })
      if (saved) toast.success('Analysis complete and saved to this browser.')
      else toast.success('Analysis complete. Browser history is unavailable in this session.')
    } catch (error) {
      if (controller.signal.aborted) {
        if (timedOutRef.current) {
          setAnalysisError({ kind: 'timeout', message: 'Analysis request timed out.' })
          setStep('configure')
        } else {
          setStep('configure')
          toast.message('Analysis canceled. Your document was not saved.')
        }
      } else {
        const message = error instanceof Error ? error.message : 'Something went wrong while analyzing this file.'
        setAnalysisError({ kind: classifyError(message), message })
        setStep('configure')
      }
    } finally {
      clearTimers()
      controllerRef.current = null
    }
  }

  const cancelAnalysis = () => {
    timedOutRef.current = false
    clearTimers()
    controllerRef.current?.abort()
  }

  const analyzeAnother = () => {
    setFile(null)
    setFileError(null)
    setAnalysisError(null)
    setResult(null)
    setResultFileName('')
    setResultCreatedAt('')
    setStep('upload')
  }

  const goToUpload = () => {
    setAnalysisError(null)
    setStep('upload')
  }

  const pageTitle = step === 'upload' ? 'Understand a resume, clearly.' : step === 'configure' ? 'Tune the analysis to your needs.' : step === 'loading' ? 'Analyzing your resume.' : 'Your analysis is ready.'

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap relative pb-32 sm:pb-28">
      <div className="mb-6 max-w-3xl">
        <p className="eyebrow">Workspace · Analyze</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-4xl">{pageTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">A private, structured first read of a resume—grounded in the document and tailored to your focus.</p>
      </div>

      <StepIndicator current={step} />

      {analysisError && step === 'configure' ? <ErrorCard error={analysisError} countdown={retryCountdown} onRetry={beginAnalysis} onUpload={goToUpload} onSample={() => { setAnalysisError(null); setStep('upload'); document.getElementById('samples')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' }) }} /> : null}

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      >
        {step === 'upload' ? <UploadStep file={file} error={fileError} onFileSelect={selectFile} onSampleSelect={chooseSample} sampleLoading={sampleLoading} /> : null}
        {step === 'configure' ? <ConfigureStep level={level} style={style} focus={focus} onLevelChange={setLevel} onStyleChange={setStyle} onFocusChange={setFocus} /> : null}
        {step === 'loading' ? <AnalysisLoading phase={loadingPhase} onCancel={cancelAnalysis} /> : null}
        {step === 'results' && result ? <ResultsDashboard result={result} fileName={resultFileName} options={options} createdAt={resultCreatedAt} onAnalyzeAnother={analyzeAnother} /> : null}
      </motion.div>

      {step === 'upload' ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-18px_rgba(15,23,42,.5)] backdrop-blur md:static md:mt-6 md:rounded-xl md:border md:shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">{file ? `${file.name} is ready` : 'Choose a PDF or TXT resume to continue.'}</p>
            <div className="ml-auto flex items-center gap-3"><span className="sr-only" id="continue-help">{file ? 'Continue to analysis settings.' : 'Select a valid resume file first.'}</span><Button size="lg" onClick={() => setStep('configure')} disabled={!file} aria-describedby="continue-help">Continue <ArrowRight data-icon="inline-end" /></Button></div>
          </div>
        </div>
      ) : null}

      {step === 'configure' ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-18px_rgba(15,23,42,.5)] backdrop-blur md:static md:mt-6 md:rounded-xl md:border md:shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Button variant="outline" onClick={() => { setAnalysisError(null); setStep('upload') }}><ArrowLeft data-icon="inline-start" />Back</Button>
            <div className="flex items-center gap-3"><span className="hidden text-xs text-muted-foreground sm:block">{file?.name}</span><Button size="lg" onClick={beginAnalysis} disabled={!file || retryCountdown > 0} title={file ? undefined : 'Choose a resume first'}>Analyze resume <ArrowRight data-icon="inline-end" /></Button></div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="size-4 text-primary" />Your file is processed per request and never stored in browser history.</div>
    </main>
  )
}
