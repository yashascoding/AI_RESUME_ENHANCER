import axios from "axios"
import type { AnalysisResult, RewrittenResume } from "@/types"

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

export async function healthCheck(): Promise<{ status: string }> {
  const { data } = await api.get("/")
  return data
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>("/analyze", {
    resume_text: resumeText,
    job_description: jobDescription,
  })
  return data
}

export async function rewriteResume(payload: {
  resume_text: string
  job_description: string
  ats_score?: number
  missing_skills?: string[]
  missing_keywords?: string[]
  weaknesses?: string[]
}): Promise<RewrittenResume> {
  const { data } = await api.post<RewrittenResume>("/rewrite", payload)
  return data
}

export async function getFileStatus(id: string) {
  const { data } = await api.get(`/files/${id}`)
  return data
}

export default api
