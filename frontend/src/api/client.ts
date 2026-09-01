import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.PROD ? "" : "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
})

// ── Token management ───────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem("token")
}

export function setToken(token: string) {
  localStorage.setItem("token", token)
}

export function removeToken() {
  localStorage.removeItem("token")
}

// ── Attach token to every request ──────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Handle 401 responses globally ──────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      removeToken()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// ── Auth API ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password })
  return data
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password })
  return data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me")
  return data
}

// ── Analysis API ───────────────────────────────────────────────────────────

import type { AnalysisResult, RewrittenResume } from "@/types"

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

// ── Analysis History API ─────────────────────────────────────────────────

export interface AnalysisHistoryItem {
  id: string
  created_at: string
  ats_score: number
  candidate_name: string
}

export async function listAnalyses(): Promise<AnalysisHistoryItem[]> {
  const { data } = await api.get<AnalysisHistoryItem[]>("/analyses")
  return data
}

export async function getAnalysisById(id: string): Promise<AnalysisResult> {
  const { data } = await api.get<AnalysisResult>(`/analyses/${id}`)
  return data
}

export async function deleteAnalysis(id: string): Promise<void> {
  await api.delete(`/analyses/${id}`)
}

export async function getAnalysisCount(): Promise<{ count: number; limit: number; is_pro: boolean }> {
  const { data } = await api.get("/analyses/count")
  return data
}

export default api
