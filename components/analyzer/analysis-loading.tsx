'use client'

import { Check, LoaderCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const phases = ['Extracting text', 'Analyzing with AI', 'Validating findings']

export function AnalysisLoading({ phase, onCancel }: { phase: number; onCancel: () => void }) {
  const progress = [18, 58, 92][Math.min(phase, phases.length - 1)]

  return (
    <section aria-busy="true" aria-labelledby="analysis-loading-title">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Step 3 · Analysis in progress</p>
            <CardTitle id="analysis-loading-title" className="mt-2 text-2xl tracking-tight">Finding the signal in your resume</CardTitle>
            <p aria-live="polite" className="mt-2 text-sm text-muted-foreground">{phases[Math.min(phase, phases.length - 1)]}…</p>
            <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">Some analyses can take a minute or more. You can safely cancel at any time.</p>
          </div>
          <Button variant="outline" onClick={onCancel}>Cancel analysis</Button>
        </CardHeader>
        <CardContent>
          <div
            role="progressbar"
            aria-label="Analysis progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none" style={{ width: `${progress}%` }} />
          </div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {phases.map((label, index) => {
              const complete = index < phase
              const active = index === phase
              return (
                <li key={label} className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${active ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-muted-foreground'}`}>
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-primary/10 text-primary' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {complete ? <Check aria-hidden="true" className="size-4" /> : active ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <span className="text-xs">{index + 1}</span>}
                  </span>
                  <span className="font-medium">{label}</span>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]" aria-hidden="true">
        <Card className="shadow-sm">
          <CardHeader><Skeleton className="h-4 w-28" /><Skeleton className="h-6 w-2/3" /></CardHeader>
          <CardContent className="flex flex-col gap-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-4/5" /></CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span><div className="flex-1"><Skeleton className="h-4 w-28" /><Skeleton className="mt-2 h-6 w-16" /></div></CardHeader>
          <CardContent><Skeleton className="h-2 w-full" /><Skeleton className="mt-5 h-16 w-full" /></CardContent>
        </Card>
      </div>
    </section>
  )
}
