'use client'

import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Analysis } from '@/lib/schemas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = { data: Analysis; score: number }

function durationInYears(value: string | null): number | null {
  if (!value) return null
  const range = value.match(/\b(19\d{2}|20\d{2})\s*(?:-|–|—|to)\s*(19\d{2}|20\d{2}|present|current|now)\b/i)
  if (range) {
    const start = Number(range[1])
    const end = /present|current|now/i.test(range[2]) ? new Date().getFullYear() : Number(range[2])
    return Math.max(0.25, Math.min(50, end - start))
  }
  const years = value.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i)
  if (years) return Math.max(0.25, Number(years[1]))
  const months = value.match(/(\d+)\s*(?:months?|mos?)/i)
  if (months) return Math.max(0.25, Number(months[1]) / 12)
  return null
}

function shortLabel(value: string): string {
  return value.length > 19 ? `${value.slice(0, 17)}…` : value
}

export default function InsightsCharts({ data, score }: Props) {
  const skillsByCategory = useMemo(() => {
    const entries = Object.entries(data.skillCategories ?? {}).map(([name, skills]) => ({ name, count: skills.length }))
    if (entries.length) return entries
    return data.skills.length ? [{ name: 'Skills', count: data.skills.length }] : []
  }, [data.skillCategories, data.skills])

  const roleDurations = useMemo(() => data.experience
    .map((role) => ({
      name: shortLabel(role.title || role.company || 'Role'),
      fullName: [role.title, role.company].filter(Boolean).join(' · ') || 'Role',
      years: durationInYears(role.duration),
      duration: role.duration,
    }))
    .filter((role) => role.years !== null), [data.experience])

  const completenessData = [
    { name: 'Complete', value: score },
    { name: 'To improve', value: Math.max(0, 100 - score) },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="min-w-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Skills by category</CardTitle>
          <p>Extracted skills grouped from the resume.</p>
        </CardHeader>
        <CardContent>
          {skillsByCategory.length ? (
            <div role="img" aria-label={`Bar chart showing ${skillsByCategory.map((item) => `${item.name}: ${item.count}`).join(', ')}`} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsByCategory} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={92} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: 12, borderColor: 'var(--border)', background: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                  <Bar dataKey="count" name="Skills" fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="rounded-xl bg-muted/50 p-5 text-sm text-muted-foreground">No skills were available to visualize.</p>}
        </CardContent>
      </Card>

      <Card className="min-w-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Experience duration</CardTitle>
          <p>Durations shown only when they can be parsed from the resume.</p>
        </CardHeader>
        <CardContent>
          {roleDurations.length ? (
            <div role="img" aria-label={`Experience duration chart for ${roleDurations.map((role) => `${role.fullName}: ${role.duration}`).join(', ')}`} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDurations} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" unit=" yr" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={92} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} years`, 'Duration']} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''} contentStyle={{ borderRadius: 12, borderColor: 'var(--border)', background: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                  <Bar dataKey="years" name="Years" fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ol className="flex flex-col gap-3">
              {data.experience.length ? data.experience.map((role, index) => (
                <li key={`${role.title}-${role.company}-${index}`} className="flex gap-3">
                  <span className="flex flex-col items-center"><span className="size-2.5 rounded-full bg-primary" />{index < data.experience.length - 1 && <span className="mt-1 h-full min-h-8 w-px bg-border" />}</span>
                  <span className="pb-2"><span className="block text-sm font-medium">{role.title || 'Role not specified'}</span><span className="text-xs text-muted-foreground">{role.company || 'Company not specified'} · {role.duration || 'Dates not stated'}</span></span>
                </li>
              )) : <li className="rounded-xl bg-muted/50 p-5 text-sm text-muted-foreground">No experience entries were available to visualize.</li>}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 shadow-sm xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Completeness</CardTitle>
          <p>A weighted view of the information present in the resume.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <div role="img" aria-label={`Completeness ${score} out of 100`} className="size-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completenessData} dataKey="value" nameKey="name" innerRadius="72%" outerRadius="96%" paddingAngle={score > 0 && score < 100 ? 3 : 0} stroke="none">
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--muted)" />
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Completeness']} contentStyle={{ borderRadius: 12, borderColor: 'var(--border)', background: 'var(--popover)', color: 'var(--popover-foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-4xl font-semibold tracking-tight">{score}<span className="text-lg font-medium text-muted-foreground">/100</span></p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">The score reflects verified candidate details, not writing quality. Missing or uncertain information is clearly identified in Fields.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
