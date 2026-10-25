'use client'

import { Button } from '@/components/ui/button'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-semibold">We couldn&apos;t load this page.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Try again, or return to the analyzer.</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </main>
  )
}
