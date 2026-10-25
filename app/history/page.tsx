'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, ArrowUpRight, FileText, Search, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { clearHistory, readHistory, removeHistoryEntry } from '@/components/analyzer/history-store'
import type { SavedAnalysis } from '@/components/analyzer/types'

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(date) + ' UTC'
}

function completenessTone(score: number) {
  return score >= 80 ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200' : score >= 55 ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200' : 'border-border bg-muted text-muted-foreground'
}

function fieldValue(entry: SavedAnalysis, field: string) {
  if (field === 'Name') return entry.data.name || 'Not found'
  if (field === 'Email') return entry.data.email || 'Not found'
  if (field === 'Skills') return entry.data.skills.join(', ') || 'Not found'
  if (field === 'Education') return entry.data.education.map((item) => [item.degree, item.institution, item.year].filter(Boolean).join(' · ')).filter(Boolean).join('\n') || 'Not found'
  return entry.data.experience.map((item) => [item.title, item.company, item.duration].filter(Boolean).join(' · ')).filter(Boolean).join('\n') || 'Not found'
}

export default function HistoryPage() {
  const [items, setItems] = useState<SavedAnalysis[]>([])
  const [ready, setReady] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'score'>('newest')
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    setItems(readHistory())
    setReady(true)
  }, [])

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = items.filter((item) => [item.fileName, item.data.name, item.data.email, ...item.data.skills].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
    return filtered.sort((a, b) => sort === 'score' ? b.completeness.score - a.completeness.score : sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt))
  }, [items, query, sort])

  const compared = compareIds.map((id) => items.find((item) => item.id === id)).filter((item): item is SavedAnalysis => Boolean(item))

  const deleteEntry = (id: string) => {
    setItems(removeHistoryEntry(id))
    setCompareIds((current) => current.filter((entryId) => entryId !== id))
    toast.success('Analysis removed from this browser.')
  }

  const toggleCompare = (id: string) => {
    setCompareIds((current) => current.includes(id) ? current.filter((entryId) => entryId !== id) : current.length < 2 ? [...current, id] : [current[1], id])
  }

  const handleClear = () => {
    if (!window.confirm('Clear all saved analyses from this browser? This cannot be undone.')) return
    clearHistory()
    setItems([])
    setCompareIds([])
    toast.success('Browser history cleared.')
  }

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap pb-16">
      <div className="page-header flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Workspace · History</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your saved analyses</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Pick up where you left off or compare two results. History stays in this browser and never includes uploaded files or source text.</p></div>
        <div className="flex gap-2"><Link className={buttonVariants({ variant: 'outline' })} href="/analyze">New analysis</Link><Button variant="destructive" disabled={!items.length} onClick={handleClear}><Trash2 data-icon="inline-start" />Clear all</Button></div>
      </div>

      <Card className="mb-5 border-primary/15 bg-primary/[0.035] shadow-none"><CardContent className="flex gap-3 p-4"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">Private to this device.</span> Results are stored locally, capped at 20, and can be deleted at any time. The original resume is not stored.</p></CardContent></Card>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:max-w-md sm:flex-1"><span className="sr-only">Search saved analyses</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, file, or skill" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring" /></label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowDownUp aria-hidden="true" className="size-4" /><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="score">Highest score</option></select></label>
      </div>

      {!ready ? <div aria-live="polite" className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading your local history…</div> : visibleItems.length ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground"><p>{visibleItems.length} {visibleItems.length === 1 ? 'analysis' : 'analyses'}</p><p className="text-xs">Choose up to two to compare</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => {
              const selected = compareIds.includes(item.id)
              return (
                <Card key={item.id} className={`group flex min-w-0 flex-col shadow-sm transition-shadow hover:shadow-md ${selected ? 'border-primary/60 ring-1 ring-primary/20' : ''}`}>
                  <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                    <div className="flex min-w-0 gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText aria-hidden="true" className="size-5" /></span><div className="min-w-0"><CardTitle className="truncate text-base">{item.data.name || item.fileName}</CardTitle><p className="mt-1 truncate text-xs text-muted-foreground">{item.fileName}</p></div></div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${completenessTone(item.completeness.score)}`}>{item.completeness.score}%</span>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col pt-0">
                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">{item.data.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-border px-2 py-1 text-[11px] capitalize text-muted-foreground">{item.level}</span><span className="rounded-full border border-border px-2 py-1 text-[11px] capitalize text-muted-foreground">{item.style}</span><span className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground">{item.data.skills.length} skills</span></div>
                    <p className="mt-4 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={selected} onChange={() => toggleCompare(item.id)} aria-label={`Select ${item.data.name || item.fileName} to compare`} className="size-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />Compare</label>
                      <div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Delete ${item.fileName}`} onClick={() => deleteEntry(item.id)}><Trash2 aria-hidden="true" /></Button><Link className={buttonVariants({ size: 'sm' })} href={`/analyze?history=${encodeURIComponent(item.id)}`}>Open <ArrowUpRight data-icon="inline-end" /></Link></div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      ) : items.length ? (
        <Card className="border-dashed shadow-none"><CardContent className="flex flex-col items-center p-10 text-center"><Search aria-hidden="true" className="size-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">No matching analyses</h2><p className="mt-2 text-sm text-muted-foreground">Try another name, file, or skill.</p><Button className="mt-5" variant="outline" onClick={() => setQuery('')}>Clear search</Button></CardContent></Card>
      ) : (
        <Card className="border-dashed shadow-none"><CardContent className="flex flex-col items-center p-10 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText aria-hidden="true" className="size-6" /></span><h2 className="mt-4 text-lg font-semibold">Your history is ready when you are</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Completed analyses are saved locally so you can reopen them without uploading the document again.</p><Link className={buttonVariants({ className: 'mt-5' })} href="/analyze">Analyze a resume</Link></CardContent></Card>
      )}

      {compared.length === 2 ? (
        <Card className="mt-8 shadow-sm">
          <CardHeader className="flex-row items-center justify-between gap-4"><div><p className="eyebrow">Side-by-side</p><CardTitle className="mt-2 text-lg">Compare analyses</CardTitle></div><Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>Close comparison</Button></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm"><thead><tr className="border-b border-border"><th scope="col" className="p-3 font-medium text-muted-foreground">Field</th>{compared.map((entry) => <th scope="col" key={entry.id} className="p-3 font-medium">{entry.data.name || entry.fileName}<span className="mt-1 block text-xs font-normal text-muted-foreground">Completeness {entry.completeness.score}%</span></th>)}</tr></thead><tbody>{['Name', 'Email', 'Skills', 'Education', 'Experience'].map((field) => <tr key={field} className="border-b border-border align-top"><th scope="row" className="p-3 font-medium">{field}</th>{compared.map((entry) => <td key={entry.id} className="whitespace-pre-line p-3 leading-6 text-muted-foreground">{fieldValue(entry, field)}</td>)}</tr>)}</tbody></table>
          </CardContent>
        </Card>
      ) : null}
    </main>
  )
}
