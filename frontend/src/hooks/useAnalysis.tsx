import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { analyzeResume, rewriteResume } from "@/api/client"
import type { AnalysisResult, RewrittenResume } from "@/types"

interface AnalysisContextValue {
  result: AnalysisResult | null
  rewritten: RewrittenResume | null
  loading: boolean
  rewriting: boolean
  error: string | null
  step: string
  resumeText: string
  jobDescription: string
  setResumeText: (text: string) => void
  setJobDescription: (text: string) => void
  runAnalysis: (resumeText: string, jobDescription: string) => Promise<void>
  runRewrite: () => Promise<void>
  reset: () => void
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [rewritten, setRewritten] = useState<RewrittenResume | null>(null)
  const [loading, setLoading] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  const runAnalysis = useCallback(async (rt: string, jd: string) => {
    setLoading(true)
    setError(null)
    setStep("Parsing resume...")
    try {
      setStep("Running AI analysis pipeline...")
      const data = await analyzeResume(rt, jd)
      setResult(data)
      setStep("")
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Analysis failed")
    } finally {
      setLoading(false)
    }
  }, [])

  const runRewrite = useCallback(async () => {
    if (!result || !resumeText || !jobDescription) return
    setRewriting(true)
    setError(null)
    try {
      const data = await rewriteResume({
        resume_text: resumeText,
        job_description: jobDescription,
        ats_score: result.ats_score?.overall_score,
        missing_skills: result.missing_skills,
        missing_keywords: result.missing_keywords,
        weaknesses: result.weaknesses,
      })
      setRewritten(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Rewrite failed")
    } finally {
      setRewriting(false)
    }
  }, [result, resumeText, jobDescription])

  const reset = useCallback(() => {
    setResult(null)
    setRewritten(null)
    setError(null)
    setStep("")
    setResumeText("")
    setJobDescription("")
  }, [])

  return (
    <AnalysisContext.Provider
      value={{
        result,
        rewritten,
        loading,
        rewriting,
        error,
        step,
        resumeText,
        jobDescription,
        setResumeText,
        setJobDescription,
        runAnalysis,
        runRewrite,
        reset,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider")
  return ctx
}
