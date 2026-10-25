import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai'
import { analysisSchema, type AnalysisLevel, type SummaryStyle } from './schemas'
import { buildResumePrompt } from './prompts'
import { validateAnalysis } from './validate'
export async function analyzeResume(text: string, level: AnalysisLevel, style: SummaryStyle, focus: string[]) {
  if (!process.env.GEMINI_API_KEY) throw new Error('MISSING_API_KEY')
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const configuredModel = process.env.GEMINI_MODEL?.trim()
  const model = !configuredModel || configuredModel === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : configuredModel
  const schema = { type: Type.OBJECT, properties: { name:{type:Type.STRING,nullable:true}, email:{type:Type.STRING,nullable:true}, skills:{type:Type.ARRAY,items:{type:Type.STRING}}, education:{type:Type.ARRAY,items:{type:Type.OBJECT,properties:{degree:{type:Type.STRING,nullable:true},institution:{type:Type.STRING,nullable:true},year:{type:Type.STRING,nullable:true}}}}, experience:{type:Type.ARRAY,items:{type:Type.OBJECT,properties:{title:{type:Type.STRING,nullable:true},company:{type:Type.STRING,nullable:true},duration:{type:Type.STRING,nullable:true},description:{type:Type.STRING,nullable:true},achievements:{type:Type.ARRAY,items:{type:Type.STRING}}}}}, summary:{type:Type.STRING}, skillCategories:{type:Type.OBJECT,additionalProperties:{type:Type.ARRAY,items:{type:Type.STRING}}}, seniority:{type:Type.STRING,nullable:true}, strengths:{type:Type.ARRAY,items:{type:Type.STRING}}, gaps:{type:Type.ARRAY,items:{type:Type.STRING}} }, required:['name','email','skills','education','experience','summary'] }
  const maxOutputTokens = level === 'basic' ? 2048 : level === 'detailed' ? 8192 : 4096
  const call = async (prompt: string) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json', responseSchema: schema, maxOutputTokens, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } })
        return JSON.parse(response.text || '{}')
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (attempt === 0 && /503|UNAVAILABLE|high demand|temporar/i.test(message)) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          continue
        }
        throw error
      }
    }
    throw new Error('GEMINI_FAILURE')
  }
  try { const first = await call(buildResumePrompt(text, level, style, focus)); try { return validateAnalysis(first, text) } catch (error) { const repaired = await call(buildResumePrompt(text, level, style, focus, error instanceof Error ? error.message : 'schema mismatch')); return validateAnalysis(repaired, text) }   } catch (error) { throw new Error(error instanceof Error && /429|quota|rate/i.test(error.message) ? 'RATE_LIMIT' : 'GEMINI_FAILURE') }
}
