'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, ArrowDownToLine, ArrowLeft, BadgeCheck, BriefcaseBusiness, Check, Clipboard, GraduationCap, Mail, Printer, Search, ShieldCheck, Sparkles, UserRound, WandSparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalysisOptions, AnalysisResponse } from './types'

const InsightsCharts = dynamic(() => import('./insights-charts'), {
  ssr: false,
  loading: () => <div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>,
})

type TabId = 'overview' | 'fields' | 'insights' | 'json'
type Status = 'Found' | 'Missing' | 'Uncertain'
type FieldItem = { key: string; label: string; value: string; present: boolean; tip: string; icon: typeof UserRound }

const tabOptions: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'fields', label: 'Fields' },
  { id: 'insights', label: 'Insights' },
  { id: 'json', label: 'Raw JSON' },
]

function safePayload(result: AnalysisResponse) {
  return {
    data: result.data,
    findings: result.findings,
    completeness: result.completeness,
    truncated: result.truncated,
  }
}

function jsonTokens(source: string) {
  const pattern = /("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g
  const output: { text: string; kind: string; key: number }[] = []
  let lastIndex = 0
  let key = 0
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) output.push({ text: source.slice(lastIndex, index), kind: 'plain', key: key++ })
    const token = match[0]
    const kind = token.endsWith(':') ? 'key' : token.startsWith('"') ? 'string' : /^(true|false|null)$/.test(token) ? 'literal' : 'number'
    output.push({ text: token, kind, key: key++ })
    lastIndex = index + token.length
  }
  if (lastIndex < source.length) output.push({ text: source.slice(lastIndex), kind: 'plain', key: key++ })
  return output
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-700 dark:text-emerald-300'
  if (score >= 55) return 'text-amber-700 dark:text-amber-300'
  return 'text-muted-foreground'
}

function getFields(result: AnalysisResponse): FieldItem[] {
  const { data, findings } = result
  const field = (key: string) => findings.some((finding) => finding.field.toLowerCase() === key)
  const education = data.education.map((item) => [item.degree, item.institution, item.year].filter(Boolean).join(' · ')).filter(Boolean).join('\n')
  const experience = data.experience.map((item) => {
    const heading = [item.title, item.company, item.duration].filter(Boolean).join(' · ')
    return [heading, item.description, ...(item.achievements ?? [])].filter(Boolean).join('\n')
  }).filter(Boolean).join('\n\n')

  return [
    { key: 'name', label: 'Name', value: data.name ?? '', present: Boolean(data.name), tip: 'Add your full name near the top of the resume so it is easy to identify.', icon: UserRound },
    { key: 'email', label: 'Email', value: data.email ?? '', present: Boolean(data.email), tip: 'Add a current, clearly formatted email address in the contact section.', icon: Mail },
    { key: 'skills', label: 'Skills', value: data.skills.join(', '), present: data.skills.length > 0, tip: 'Add a concise skills section with tools and strengths you can support with examples.', icon: WandSparkles },
    { key: 'education', label: 'Education', value: education, present: data.education.length > 0, tip: 'Include a qualification, institution, and year where relevant.', icon: GraduationCap },
    { key: 'experience', label: 'Experience', value: experience, present: data.experience.length > 0, tip: 'Add role titles, employers, dates, and measurable outcomes for recent experience.', icon: BriefcaseBusiness },
  ].map((item) => ({ ...item, present: item.present, value: item.value, tip: item.tip, icon: item.icon, key: item.key, label: item.label, ...(field(item.key) ? { uncertain: true } : {}) })) as (FieldItem & { uncertain?: boolean })[] as FieldItem[]
}

function statusFor(item: FieldItem, findings: AnalysisResponse['findings']): Status {
  if (findings.some((finding) => finding.field.toLowerCase() === item.key)) return 'Uncertain'
  return item.present ? 'Found' : 'Missing'
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    Found: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
    Missing: 'border-border bg-muted text-muted-foreground',
    Uncertain: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>
}

function CompletenessGauge({ score }: { score: number }) {
  return (
    <div className="relative flex size-28 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${score * 3.6}deg, var(--muted) 0deg)` }} role="img" aria-label={`Completeness score ${score} out of 100`}>
      <div className="flex size-[calc(100%-12px)] flex-col items-center justify-center rounded-full bg-card">
        <span className={`text-2xl font-semibold tracking-tight ${scoreColor(score)}`}>{score}</span>
        <span className="text-[11px] text-muted-foreground">out of 100</span>
      </div>
    </div>
  )
}

function OverviewPanel({ result }: { result: AnalysisResponse }) {
  const { data, completeness } = result
  const stats = [
    { label: 'Verified skills', value: data.skills.length, icon: WandSparkles },
    { label: 'Experience roles', value: data.experience.length, icon: BriefcaseBusiness },
    { label: 'Education entries', value: data.education.length, icon: GraduationCap },
  ]

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <Card className="min-w-0 shadow-sm">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div><p className="eyebrow">Candidate summary</p><CardTitle className="mt-2 text-xl">The profile at a glance</CardTitle></div>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles aria-hidden="true" className="size-5" /></span>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{data.summary}</p>
          {(data.strengths?.length || data.gaps?.length) ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {data.strengths?.length ? <div className="rounded-xl border border-border bg-muted/30 p-4"><h3 className="text-sm font-semibold">Key strengths</h3><ul className="mt-3 flex flex-col gap-2">{data.strengths.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-muted-foreground"><Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />{item}</li>)}</ul></div> : null}
              {data.gaps?.length ? <div className="rounded-xl border border-border bg-muted/30 p-4"><h3 className="text-sm font-semibold">Gaps to review</h3><ul className="mt-3 flex flex-col gap-2">{data.gaps.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-muted-foreground"><AlertTriangle aria-hidden="true" className="mt-1 size-4 shrink-0 text-amber-600" />{item}</li>)}</ul></div> : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <CompletenessGauge score={completeness.score} />
            <div><p className="text-sm font-semibold">Completeness</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Weighted across name, contact, skills, education, and experience.</p></div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => <Card key={label} className="shadow-sm"><CardContent className="p-4"><Icon aria-hidden="true" className="size-4 text-primary" /><p className="mt-3 text-xl font-semibold">{value}</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{label}</p></CardContent></Card>)}
        </div>
      </div>

      {(completeness.missing.length > 0 || completeness.uncertain.length > 0) && (
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm dark:border-amber-900 dark:bg-amber-950/20 xl:col-span-2">
          <CardContent className="flex gap-3 p-4">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div><p className="text-sm font-semibold">A few details need a closer look</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Review the Fields tab for missing information and findings that could not be verified against the document.</p></div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FieldsPanel({ result }: { result: AnalysisResponse }) {
  const [query, setQuery] = useState('')
  const [issuesOnly, setIssuesOnly] = useState(false)
  const fields = useMemo(() => getFields(result), [result])
  const visibleFields = fields.filter((item) => {
    const status = statusFor(item, result.findings)
    return (!issuesOnly || status !== 'Found') && (!query || item.value.toLowerCase().includes(query.toLowerCase()) || item.label.toLowerCase().includes(query.toLowerCase()))
  })
  const skillMatches = result.data.skills.filter((skill) => skill.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-semibold">Extracted fields</h2><p className="mt-1 text-sm text-muted-foreground">Missing information is left blank. Uncertain findings are flagged explicitly.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block sm:w-64"><span className="sr-only">Search extracted fields and skills</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search fields or skills" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <Button type="button" variant={issuesOnly ? 'secondary' : 'outline'} aria-pressed={issuesOnly} onClick={() => setIssuesOnly((current) => !current)}>{issuesOnly ? 'Showing issues' : 'Show issues only'}</Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleFields.map((item) => {
          const status = statusFor(item, result.findings)
          const Icon = item.icon
          const messages = result.findings.filter((finding) => finding.field.toLowerCase() === item.key).map((finding) => finding.message)
          return (
            <Card key={item.key} className="min-w-0 shadow-sm">
              <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon aria-hidden="true" className="size-4" /></span><CardTitle className="text-sm">{item.label}</CardTitle></div>
                <StatusBadge status={status} />
              </CardHeader>
              <CardContent>
                {item.key === 'skills' && query ? (
                  skillMatches.length ? <ul className="flex flex-wrap gap-2">{skillMatches.map((skill) => <li key={skill} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs">{skill}</li>)}</ul> : <p className="text-sm text-muted-foreground">No matching skills.</p>
                ) : item.value ? <p className="whitespace-pre-line break-words text-sm leading-6 text-muted-foreground">{item.value}</p> : <p className="text-sm italic text-muted-foreground">Not found in this document.</p>}
                {messages.length ? <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">{messages.join(' ')}</div> : null}
                {status === 'Missing' ? <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground">Improve this field: </span>{item.tip}</p> : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
      {!visibleFields.length ? <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No fields match the current filters.</div> : null}
    </div>
  )
}

function RawJsonPanel({ result, onCopy }: { result: AnalysisResponse; onCopy: () => void }) {
  const source = useMemo(() => JSON.stringify(safePayload(result), null, 2), [result])
  const tokens = useMemo(() => jsonTokens(source), [source])
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border bg-muted/30">
        <div><CardTitle className="text-base">Structured response</CardTitle><p className="mt-1 text-sm text-muted-foreground">Validated output only. Raw resume text is not included.</p></div>
        <Button variant="outline" size="sm" onClick={onCopy}><Clipboard data-icon="inline-start" />Copy JSON</Button>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="max-h-[560px] overflow-auto p-4 text-xs leading-6 sm:p-6 sm:text-sm"><code>{tokens.map((token) => <span key={token.key} className={token.kind === 'key' ? 'text-indigo-700 dark:text-indigo-300' : token.kind === 'string' ? 'text-emerald-700 dark:text-emerald-300' : token.kind === 'literal' ? 'text-amber-700 dark:text-amber-300' : token.kind === 'number' ? 'text-sky-700 dark:text-sky-300' : 'text-foreground'}>{token.text}</span>)}</code></pre>
      </CardContent>
    </Card>
  )
}

function PrintSummary({ result, fileName }: { result: AnalysisResponse; fileName: string }) {
  const fields = getFields(result)
  return (
    <section className="hidden print:block">
      <h1 className="text-2xl font-semibold">ResumeLens analysis · {fileName}</h1>
      <p className="mt-1 text-sm">Completeness: {result.completeness.score}/100</p>
      <h2 className="mt-6 text-lg font-semibold">Summary</h2><p className="mt-2 whitespace-pre-line text-sm leading-6">{result.data.summary}</p>
      {result.data.strengths?.length ? <><h2 className="mt-6 text-lg font-semibold">Key strengths</h2><ul className="mt-2 list-disc pl-5 text-sm">{result.data.strengths.map((strength, index) => <li key={`${strength}-${index}`}>{strength}</li>)}</ul></> : null}
      <h2 className="mt-6 text-lg font-semibold">Extracted fields</h2>
      <div className="mt-2 flex flex-col gap-3">{fields.map((item) => <div key={item.key} className="border-b border-gray-300 pb-2"><p className="text-sm font-semibold">{item.label} · {statusFor(item, result.findings)}</p><p className="mt-1 whitespace-pre-line text-sm">{item.value || 'Not found in this document.'}</p></div>)}</div>
    </section>
  )
}

export function ResultsDashboard({
  result,
  fileName,
  options,
  createdAt,
  onAnalyzeAnother,
}: {
  result: AnalysisResponse
  fileName: string
  options: AnalysisOptions
  createdAt: string
  onAnalyzeAnother: () => void
}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const reduceMotion = useReducedMotion()
  const payload = useMemo(() => safePayload(result), [result])
  const json = useMemo(() => JSON.stringify(payload, null, 2), [payload])
  const fileSlug = fileName.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume'
  const dateLabel = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(createdAt))

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json)
      toast.success('Structured result copied to clipboard.')
    } catch {
      toast.error('Could not access the clipboard. Try downloading the JSON instead.')
    }
  }

  const downloadJson = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${fileSlug}-analysis.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Your JSON export is ready.')
  }

  const selectTabWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabOptions.findIndex((tab) => tab.id === activeTab)
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabOptions.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabOptions.length) % tabOptions.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabOptions.length - 1
    if (nextIndex !== index) {
      event.preventDefault()
      const nextTab = tabOptions[nextIndex]
      setActiveTab(nextTab.id)
      document.getElementById(`result-tab-${nextTab.id}`)?.focus()
    }
  }

  return (
    <div className="analysis-results">
      <PrintSummary result={result} fileName={fileName} />
      <div className="print:hidden">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Analysis complete</p>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{result.data.name || fileName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{fileName} <span aria-hidden="true">·</span> Analyzed {dateLabel} UTC</p>
            <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs capitalize text-muted-foreground">{options.level} analysis</span><span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs capitalize text-muted-foreground">{options.style} summary</span>{options.focus.map((area) => <span key={area} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">{area}</span>)}</div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => window.print()}><Printer data-icon="inline-start" />Print / PDF</Button>
            <Button variant="outline" onClick={copyJson}><Clipboard data-icon="inline-start" />Copy JSON</Button>
            <Button variant="outline" onClick={downloadJson}><ArrowDownToLine data-icon="inline-start" />Download</Button>
            <Button onClick={onAnalyzeAnother}><ArrowLeft data-icon="inline-start" />Analyze another</Button>
          </div>
        </div>

        {result.truncated ? <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>The resume was longer than the analysis limit. Only the first portion of the document was included.</p></div> : null}

        <div role="tablist" aria-label="Analysis result sections" onKeyDown={selectTabWithKeyboard} className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1">
          {tabOptions.map((tab) => <button key={tab.id} id={`result-tab-${tab.id}`} role="tab" type="button" aria-selected={activeTab === tab.id} aria-controls={`result-panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => setActiveTab(tab.id)} className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab.label}</button>)}
        </div>

        <motion.section
          key={activeTab}
          id={`result-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`result-tab-${activeTab}`}
          tabIndex={0}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {activeTab === 'overview' ? <OverviewPanel result={result} /> : null}
          {activeTab === 'fields' ? <FieldsPanel result={result} /> : null}
          {activeTab === 'insights' ? <InsightsCharts data={result.data} score={result.completeness.score} /> : null}
          {activeTab === 'json' ? <RawJsonPanel result={result} onCopy={copyJson} /> : null}
        </motion.section>
        <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><BadgeCheck aria-hidden="true" className="size-4 text-primary" />Your structured result is saved in this browser only. The uploaded file and extracted source text are not saved.</p>
      </div>
    </div>
  )
}
