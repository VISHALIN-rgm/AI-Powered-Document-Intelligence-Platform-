'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button, buttonVariants } from '@/components/ui/button'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

const links = [
  { href: '/analyze', label: 'Analyze' },
  { href: '/history', label: 'History' },
  { href: '/how-it-works', label: 'How it works' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavigationLinks({ pathname, onNavigate, mobile = false }: { pathname: string; onNavigate?: () => void; mobile?: boolean }) {
  return (
    <nav aria-label={mobile ? 'Mobile navigation' : 'Main navigation'} className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
      {links.map((link) => {
        const active = isActive(pathname, link.href)
        const className = link.href === '/analyze'
          ? buttonVariants({ size: mobile ? 'default' : 'sm', className: mobile ? 'w-full justify-start' : undefined })
          : cn(
              'rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              mobile && 'w-full',
            )

        return (
          <Link key={link.href} href={link.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={className}>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    mobilePanelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return
      if (mobilePanelRef.current?.contains(event.target) || menuButtonRef.current?.contains(event.target)) return
      setMobileOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [mobileOpen])

  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight" aria-label="ResumeLens home" aria-current={pathname === '/' ? 'page' : undefined}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FileText aria-hidden="true" className="size-4" /></span>
            <span>ResumeLens</span>
          </Link>

          <div className="hidden md:block"><NavigationLinks pathname={pathname} /></div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(nextTheme)}
              aria-label={mounted ? `Switch to ${nextTheme} mode` : 'Toggle color theme'}
              title={mounted ? `Switch to ${nextTheme} mode` : 'Toggle color theme'}
            >
              {mounted && resolvedTheme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((current) => !current)}
            >
              {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
          </div>
        </div>
        <div id="mobile-navigation" ref={mobilePanelRef} hidden={!mobileOpen} className="border-t border-border bg-background px-4 py-3 shadow-sm md:hidden">
          <NavigationLinks pathname={pathname} mobile onNavigate={() => setMobileOpen(false)} />
        </div>
      </header>

      <div>{children}</div>

      <footer className="border-t border-border/70 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>ResumeLens · Document intelligence for resumes.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2"><p>Original files are processed per request and never stored.</p><Link className="underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/how-it-works">Privacy and limitations</Link></div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" closeButton />
    </div>
  )
}
