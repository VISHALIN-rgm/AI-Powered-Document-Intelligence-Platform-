import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold">This page wandered off.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The page you’re looking for doesn’t exist, but your next resume review can start here.</p>
      <Link className={buttonVariants({ className: 'mt-6' })} href="/analyze">Open analyzer</Link>
    </main>
  )
}
