import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import AppShell from '@/components/app-shell'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://resumelens.vercel.app'),
  applicationName: 'ResumeLens',
  title: { default: 'ResumeLens — AI resume intelligence', template: '%s | ResumeLens' },
  description: 'Grounded, structured AI analysis for resumes. Extract key details, generate useful summaries, and review visual insights.',
  keywords: ['resume analysis', 'AI resume summary', 'resume extraction', 'document intelligence'],
  openGraph: {
    title: 'ResumeLens — AI resume intelligence',
    description: 'See the signal in every resume with grounded summaries and structured insights.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ResumeLens',
  },
  twitter: {
    card: 'summary',
    title: 'ResumeLens — AI resume intelligence',
    description: 'Grounded, structured AI analysis for resumes.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafbff' },
    { media: '(prefers-color-scheme: dark)', color: '#171923' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
