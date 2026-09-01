import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { analyzeResume, rewriteResume, getAnalysisById } from "@/api/client"
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
  loadAnalysis: (id: string) => Promise<void>
  reset: () => void
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

const STORAGE_KEY = "resume_enhancer_analysis"

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return {
        result: data.result ?? null,
        rewritten: data.rewritten ?? null,
        resumeText: data.resumeText ?? "",
        jobDescription: data.jobDescription ?? "",
      }
    }
  } catch {}
  return null
}

function persistState(result: AnalysisResult | null, rewritten: RewrittenResume | null, resumeText: string, jobDescription: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ result, rewritten, resumeText, jobDescription }))
  } catch {}
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted()

  const [result, setResult] = useState<AnalysisResult | null>(persisted?.result ?? null)
  const [rewritten, setRewritten] = useState<RewrittenResume | null>(persisted?.rewritten ?? null)
  const [loading, setLoading] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState("")
  const [resumeText, setResumeText] = useState(persisted?.resumeText ?? "")
  const [jobDescription, setJobDescription] = useState(persisted?.jobDescription ?? "")

  useEffect(() => {
    persistState(result, rewritten, resumeText, jobDescription)
  }, [result, rewritten, resumeText, jobDescription])

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

  const loadAnalysis = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAnalysisById(id)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Failed to load analysis")
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setRewritten(null)
    setError(null)
    setStep("")
    setResumeText("")
    setJobDescription("")
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
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
        loadAnalysis,
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
