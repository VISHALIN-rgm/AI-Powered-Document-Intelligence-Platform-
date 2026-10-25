import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main id="main-content" tabIndex={-1} aria-busy="true" className="page-wrap">
      <p role="status" className="sr-only">Loading page content</p>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </main>
  )
}
