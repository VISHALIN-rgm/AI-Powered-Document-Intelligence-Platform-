'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, FileText, Gauge, LockKeyhole, Sparkles, WandSparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  { icon: Sparkles, title: 'Smart summaries', text: 'Get a grounded view of a candidate’s profile, strengths, achievements, and key findings.' },
  { icon: FileText, title: 'Structured extraction', text: 'Turn unstructured resumes into clear contact, skills, education, and experience fields.' },
  { icon: Gauge, title: 'Completeness insights', text: 'See what is present, missing, or uncertain with a transparent weighted score.' },
]

const questions = [
  { question: 'Which file types can I analyze?', answer: 'ResumeLens accepts PDF and plain text (.txt) files up to 4 MB. Scanned PDFs without selectable text are not supported yet.' },
  { question: 'Is my resume stored?', answer: 'Your document is processed for the current analysis and is not saved to a server database or browser history. Only the structured result and display metadata can be saved locally in this browser.' },
  { question: 'Can the AI invent missing details?', answer: 'The analysis is instructed to use only information found in your resume. Extracted fields are validated against the source, and missing information is left empty instead of guessed.' },
]

export default function LandingPage() {
  const reduceMotion = useReducedMotion()
  const reveal = { opacity: 0, y: 16 }
  const transition = { duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' as const }

  return (
    <main id="main-content" tabIndex={-1} className="overflow-hidden">
      <section className="hero-grid relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-10 lg:pt-24">
        <motion.div initial={reveal} animate={{ opacity: 1, y: 0 }} transition={transition} className="min-w-0">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-primary" /> AI-powered resume intelligence
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">See the signal <span className="text-primary">in every resume.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Turn a resume into a clear, structured understanding of the candidate—without losing the human details that matter.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonVariants({ size: 'lg' })} href="/analyze">Analyze a resume <ArrowRight data-icon="inline-end" /></Link>
            <Link className={buttonVariants({ size: 'lg', variant: 'outline' })} href="/analyze#samples">Try a sample</Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm">
            <span className="inline-flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="size-4 text-primary" />PDF and TXT</span>
            <span className="inline-flex items-center gap-2"><LockKeyhole aria-hidden="true" className="size-4 text-primary" />Private by design</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="size-4 text-primary" />No database required</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...transition, delay: reduceMotion ? 0 : 0.08 }} className="relative mx-auto w-full min-w-0 max-w-xl">
          <div aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem] bg-primary/5 blur-2xl" />
          <Card className="relative overflow-hidden border-border/80 bg-card shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText aria-hidden="true" className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">Jordan Lee · Resume analysis</p><p className="text-xs text-muted-foreground">Preview of a structured result</p></div></div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">Complete</span>
            </div>
            <div className="grid gap-5 p-5 sm:p-6">
              <div><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles aria-hidden="true" className="size-4 text-primary" />Candidate summary</div><p className="mt-3 text-sm leading-6 text-muted-foreground">Product-minded software engineer with 7+ years building accessible web products. Strong frontend foundations, cross-functional leadership, and measurable improvements to customer onboarding.</p></div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[['Skills', '12'], ['Roles', '3'], ['Education', '2']].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-muted/30 p-3"><p className="text-xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></div>)}
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Skills at a glance</p><span className="text-xs text-muted-foreground">12 verified</span></div>
                <div className="mt-3 flex flex-wrap gap-2">{['React', 'TypeScript', 'Design systems', 'Product strategy'].map((skill) => <span key={skill} className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary">{skill}</span>)}</div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3"><div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check aria-hidden="true" className="size-4" /></div><p className="text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground">Grounded in the source.</span> Missing or uncertain details are clearly marked.</p></div>
            </div>
          </Card>
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:block"><div className="flex items-center gap-2"><WandSparkles aria-hidden="true" className="size-4 text-primary" /><span className="text-xs font-medium">No detail invented</span></div></div>
        </motion.div>
      </section>

      <section className="border-y border-border/70 bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl"><p className="eyebrow">A clearer first read</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From document to decision-ready context.</h2><p className="mt-4 leading-7 text-muted-foreground">Spend less time scanning for details and more time making thoughtful, informed decisions.</p></div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }, index) => <motion.div key={title} initial={reveal} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.06 }}><Card className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md"><CardHeader><Icon aria-hidden="true" className="size-5 text-primary" /><CardTitle className="mt-3 text-base">{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{text}</CardContent></Card></motion.div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><p className="eyebrow">How it works</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Three steps to a sharper overview.</h2><div className="mt-7 flex flex-col gap-5">
            {[['01', 'Upload a resume', 'Add a PDF or TXT file, or explore a sample document.'], ['02', 'Choose your lens', 'Set the analysis depth, summary format, and focus areas.'], ['03', 'Review the findings', 'Explore verified fields, visual insights, and completeness.']].map(([number, title, description]) => <div key={number} className="flex gap-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/5 text-xs font-semibold text-primary">{number}</span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></div>)}
          </div><Link className={buttonVariants({ variant: 'link', className: 'mt-6 px-0' })} href="/how-it-works">See how ResumeLens works <ArrowRight data-icon="inline-end" /></Link></div>
          <Card className="border-border/80 bg-card shadow-sm"><CardHeader><p className="eyebrow">Built for clarity</p><CardTitle className="text-xl">A thoughtful workflow, not another black box.</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
            {[['Grounded results', 'Summaries are based only on source text.'], ['Field-level review', 'Missing and uncertain details are easy to spot.'], ['Flexible depth', 'Choose a quick scan or a more detailed analysis.'], ['Private by default', 'Files are processed per request, never added to history.']].map(([title, text]) => <div key={title} className="rounded-xl border border-border bg-muted/20 p-4"><CheckCircle2 aria-hidden="true" className="size-4 text-primary" /><p className="mt-3 text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>)}
          </CardContent></Card>
        </div>
      </section>

      <section className="border-y border-border/70 bg-muted/25">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="eyebrow">Frequently asked</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Good to know before you start.</h2>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card px-5 sm:px-6">{questions.map(({ question, answer }) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">{question}<span aria-hidden="true" className="text-lg text-muted-foreground transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}</div>
          <p className="mt-4 text-xs text-muted-foreground">ResumeLens is designed for resumes and does not use OCR for scanned PDFs. Documents are limited to 4 MB.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10 md:flex-row md:items-center">
          <div><p className="text-sm font-medium text-primary-foreground/75">A better first read starts here</p><h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">Make every resume easier to understand.</h2></div>
          <Link className={buttonVariants({ size: 'lg', variant: 'secondary' })} href="/analyze">Analyze a resume <ArrowRight data-icon="inline-end" /></Link>
        </div>
      </section>
    </main>
  )
}
