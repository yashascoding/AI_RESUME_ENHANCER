export interface Education {
  degree: string
  institution: string
  year: string | null
  details: string | null
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  highlights: string[]
}

export interface ExperienceEntry {
  title: string
  company: string
  duration: string | null
  description: string
  highlights: string[]
}

export interface Certification {
  name: string
  issuer: string | null
  year: string | null
}

export interface ParsedResume {
  name: string
  email: string | null
  phone: string | null
  summary: string | null
  education: Education[]
  projects: Project[]
  skills: string[]
  experience: ExperienceEntry[]
  achievements: string[]
  certifications: Certification[]
}

export interface ResumeSkills {
  programming_languages: string[]
  frameworks: string[]
  libraries: string[]
  databases: string[]
  cloud: string[]
  ai_tools: string[]
  developer_tools: string[]
  soft_skills: string[]
}

export interface ExperienceAnalysis {
  project_quality: string
  internship_relevance: string
  open_source: string
  leadership: string
  quantified_achievements: string
  action_verbs: string
  business_impact: string
  readability: string
  formatting: string
  strengths: string[]
  weaknesses: string[]
}

export interface JDSkills {
  required_skills: string[]
  preferred_skills: string[]
  responsibilities: string[]
  experience_requirements: string[]
  ats_keywords: string[]
}

export interface GapAnalysis {
  matched_skills: string[]
  missing_skills: string[]
  missing_keywords: string[]
  technology_gaps: string[]
  recommendations: string[]
}

export interface ATSBreakdown {
  skills_score: number
  projects_score: number
  experience_score: number
  keywords_score: number
  achievements_score: number
  formatting_score: number
}

export interface ATSReason {
  category: string
  score: number
  reason: string
}

export interface ATSScore {
  overall_score: number
  breakdown: ATSBreakdown
  reasons: ATSReason[]
}

export interface RewrittenSection {
  section: string
  original: string
  improved: string
  changes_made: string
}

export interface RewrittenResume {
  rewritten_sections: RewrittenSection[]
  full_improved_resume: string
  changes_summary: string
}

export interface InterviewQuestion {
  question: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  focus: string
}

export interface InterviewQuestions {
  resume_questions: InterviewQuestion[]
  technical_questions: InterviewQuestion[]
  behavioral_questions: InterviewQuestion[]
  project_deep_dive: InterviewQuestion[]
}

export interface HiringReadiness {
  readiness_score: number
  top_strengths: string[]
  top_weaknesses: string[]
  high_priority_improvements: string[]
  suggested_roles: string[]
  internship_readiness: string
  sde1_readiness: string
}

export interface FinalReport {
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  matched_skills: string[]
  missing_skills: string[]
  recommendations: string[]
  improved_resume: string | null
  interview_questions: InterviewQuestions | null
  hiring_readiness: HiringReadiness | null
  overall_summary: string
}

export interface AnalysisResult {
  parsed_resume?: ParsedResume
  resume_skills?: ResumeSkills
  experience_analysis?: ExperienceAnalysis
  jd_skills?: JDSkills
  ats_score?: ATSScore
  ats_breakdown?: ATSBreakdown
  rewritten_resume?: RewrittenResume
  interview_questions?: InterviewQuestions
  hiring_readiness?: HiringReadiness
  final_report?: FinalReport
  matched_skills: string[]
  missing_skills: string[]
  missing_keywords: string[]
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}
