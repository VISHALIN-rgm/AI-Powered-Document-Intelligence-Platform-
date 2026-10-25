'use client'
import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
export function Accordion({ children }: { type?: 'single'; collapsible?: boolean; children: React.ReactNode }) { return <div>{children}</div> }
export function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) { return <details className="group border-b border-border" name="resumelens-faq"><>{children}</></details> }
export function AccordionTrigger({ children }: { children: React.ReactNode }) { return <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-medium [&::-webkit-details-marker]:hidden">{children}<ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary> }
export function AccordionContent({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn('pb-4 text-sm', className)}>{children}</div> }
