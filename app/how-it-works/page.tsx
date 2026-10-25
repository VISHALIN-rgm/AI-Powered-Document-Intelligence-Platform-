'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, FileText, LockKeyhole, ScanText, ShieldCheck, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const steps = [
  { title: 'Add a resume', description: 'Upload a PDF or plain text file, or start with one of the built-in samples.', icon: FileText },
  { title: 'Choose your lens', description: 'Select an analysis depth, summary format, and the sections you care about.', icon: ScanText },
  { title: 'Review the result', description: 'Explore a grounded summary, extracted fields, visual insights, and completeness.', icon: Sparkles },
]

const limitations = [
  { title: 'No OCR for scans', description: 'PDFs need selectable text. Scanned image-only documents cannot be read.', icon: ScanText },
  { title: '4 MB upload limit', description: 'A small serverless-friendly limit helps keep processing predictable.', icon: FileText },
  { title: 'Long text is shortened', description: 'Documents over about 30,000 characters are truncated before analysis and clearly flagged.', icon: AlertTriangle },
  { title: 'Resume-focused', description: 'The extraction fields and completeness score are designed for resumes, not general document analysis.', icon: ShieldCheck },
  { title: 'AI can be imperfect', description: 'Review important findings. Gemini can return incomplete or uncertain results, and rate limits may temporarily apply.', icon: Sparkles },
  { title: 'Private by default', description: 'Uploaded files are processed per request. Browser history stores only structured results—not the original file or extracted source text.', icon: LockKeyhole },
]

export default function HowItWorksPage() {
  const reduceMotion = useReducedMotion()
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <div className="page-header"><p className="eyebrow">How it works</p><h1>Clarity from every resume.</h1><p>ResumeLens combines text extraction, grounded Gemini analysis, and validation checks to make resume review faster and more consistent.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ title, description, icon: Icon }, index) => <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.05 }}><Card className="h-full shadow-sm"><CardHeader><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><CardTitle className="pt-2 text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{description}</CardContent></Card></motion.div>)}
      </div>
      <section className="mt-14 sm:mt-20" aria-labelledby="limitations-heading">
        <div className="max-w-2xl"><p className="eyebrow">Transparent by design</p><h2 id="limitations-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">What to expect—and what not to.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">ResumeLens helps organize information, but it does not replace careful human review.</p></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {limitations.map(({ title, description, icon: Icon }) => <Card key={title} className="shadow-none"><CardContent className="flex gap-3 p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon aria-hidden="true" className="size-4" /></span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></CardContent></Card>)}
        </div>
      </section>
      <section className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div><h2 className="font-semibold">Ready to see it in action?</h2><p className="mt-1 text-sm text-muted-foreground">Start with your own resume or choose a sample.</p></div>
        <Link className={buttonVariants()} href="/analyze">Open analyzer</Link>
      </section>
    </main>
  )
}
