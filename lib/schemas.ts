import { z } from 'zod'

export const educationSchema = z.object({ degree: z.string().nullable(), institution: z.string().nullable(), year: z.string().nullable() })
export const experienceSchema = z.object({ title: z.string().nullable(), company: z.string().nullable(), duration: z.string().nullable(), description: z.string().nullable(), achievements: z.array(z.string()).optional() })
export const analysisSchema = z.object({
  name: z.string().nullable(), email: z.string().nullable(), skills: z.array(z.string()), education: z.array(educationSchema), experience: z.array(experienceSchema),
  summary: z.string(), skillCategories: z.record(z.string(), z.array(z.string())).optional(), seniority: z.string().nullable().optional(), strengths: z.array(z.string()).optional(), gaps: z.array(z.string()).optional(),
})
export type Analysis = z.infer<typeof analysisSchema>
export type AnalysisLevel = 'basic' | 'standard' | 'detailed'
export type SummaryStyle = 'brief' | 'detailed' | 'bullets'
export const focusAreas = ['Skills', 'Education', 'Experience', 'Contact'] as const
