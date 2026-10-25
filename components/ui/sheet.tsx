'use client'
import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
const Context = React.createContext<{open:boolean;setOpen:(open:boolean)=>void}>({open:false,setOpen:()=>{}})
export function Sheet({ children }: { children: React.ReactNode }) { const [open,setOpen]=React.useState(false); return <Context.Provider value={{open,setOpen}}>{children}</Context.Provider> }
export function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) { const {setOpen}=React.useContext(Context); return asChild ? React.cloneElement(children as React.ReactElement<{onClick?:()=>void}>, {onClick:()=>setOpen(true)}) : <button onClick={()=>setOpen(true)}>{children}</button> }
export function SheetContent({ children, className }: { children: React.ReactNode; className?: string }) { const {open,setOpen}=React.useContext(Context); if(!open)return null; return <div className="fixed inset-0 z-50 bg-black/40" role="dialog" aria-modal="true"><div className={cn('absolute right-0 h-full w-[min(22rem,90vw)] bg-background p-6 shadow-xl',className)}><button className="absolute right-4 top-4 rounded-md p-2" onClick={()=>setOpen(false)} aria-label="Close"><X /></button>{children}</div></div> }
export function SheetTitle({ children }: { children: React.ReactNode }) { return <h2 className="text-lg font-semibold">{children}</h2> }
