import { useNavigate } from "react-router-dom"
import { useAnalysis } from "@/hooks/useAnalysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ATSScoreGauge } from "@/components/dashboard/ATSScoreGauge"
import { ScoreBreakdown } from "@/components/dashboard/ScoreBreakdown"
import { GapAnalysisTable } from "@/components/dashboard/GapAnalysisTable"
import { StrengthsWeaknesses } from "@/components/dashboard/StrengthsWeaknesses"
import { ParsedResumeCard } from "@/components/resume/ParsedResumeCard"
import { ExperienceCard } from "@/components/resume/ExperienceCard"
import { ResumeEditor } from "@/components/resume/ResumeEditor"
import { SkillsOverview } from "@/components/skills/SkillsOverview"
import { JDSkillsCard } from "@/components/skills/JDSkillsCard"
import { InterviewQuestions } from "@/components/interview/InterviewQuestions"
import { HiringReadiness } from "@/components/career/HiringReadiness"
import { OverallSummary } from "@/components/career/OverallSummary"
import {
  BarChart3,
  FileText,
  Cpu,
  Target,
  GitCompareArrows,
  PenLine,
  MessageSquare,
  Trophy,
  Loader2,
  Pen,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"

export function Results() {
  const { result, rewritten, rewriting, runRewrite } = useAnalysis()
  const navigate = useNavigate()

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-zinc-600" />
        </div>
        <p className="text-zinc-400">No analysis results found</p>
        <Button onClick={() => navigate("/analyze")} className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
          Run an Analysis
        </Button>
      </div>
    )
  }

  const handleRewrite = async () => {
    await runRewrite()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Resume Analysis</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-9">
            Complete pipeline output across all 9 nodes
          </p>
        </div>
        <div className="flex gap-2 ml-9 sm:ml-0">
          <Button variant="outline" onClick={() => navigate("/analyze")} className="gap-2">
            New Analysis
          </Button>
          <Button onClick={handleRewrite} disabled={rewriting} className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
            {rewriting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pen className="h-4 w-4" />
            )}
            Improve Resume
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="parsed" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="gap" className="gap-1.5">
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Gap Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Experience</span>
            </TabsTrigger>
            <TabsTrigger value="ats" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ATS Score</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="career" className="gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Career</span>
            </TabsTrigger>
            <TabsTrigger value="enhance" className="gap-1.5">
              <PenLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Enhance</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Hero Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="flex items-center justify-center py-8">
                {result.ats_score ? (
                  <ATSScoreGauge score={result.ats_score.overall_score} />
                ) : (
                  <span className="text-zinc-500 text-sm">No ATS score available</span>
                )}
              </CardContent>
            </Card>
            <div className="lg:col-span-2">
              {result.ats_score?.breakdown && (
                <ScoreBreakdown breakdown={result.ats_score.breakdown} />
              )}
            </div>
          </div>

          {/* Summary */}
          {result.final_report && (
            <OverallSummary summary={result.final_report.overall_summary} />
          )}

          {/* Key Findings */}
          {(result.strengths.length > 0 || result.weaknesses.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-zinc-300">Key Findings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.strengths.slice(0, 3).map((s, i) => (
                  <div key={`s-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-300">{s}</span>
                  </div>
                ))}
                {result.weaknesses.slice(0, 3).map((w, i) => (
                  <div key={`w-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span className="text-sm text-zinc-300">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <StrengthsWeaknesses
            strengths={result.strengths}
            weaknesses={result.weaknesses}
          />

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3 text-zinc-300">Top Improvements</h3>
                <div className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
                      <span className="h-5 w-5 rounded-md bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-300">{r}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Parsed Resume */}
        <TabsContent value="parsed">
          {result.parsed_resume ? (
            <ParsedResumeCard data={result.parsed_resume} />
          ) : (
            <EmptyNode label="Resume Parser" />
          )}
        </TabsContent>

        {/* Tab 3: Skills */}
        <TabsContent value="skills">
          {result.resume_skills ? (
            <SkillsOverview data={result.resume_skills} />
          ) : (
            <EmptyNode label="Skill Extractor" />
          )}
        </TabsContent>

        {/* Tab 4: Gap Analysis */}
        <TabsContent value="gap" className="space-y-6">
          <GapAnalysisTable
            matched={result.matched_skills}
            missing={result.missing_skills}
            missingKeywords={result.missing_keywords}
          />
          {result.jd_skills && (
            <JDSkillsCard data={result.jd_skills} />
          )}
        </TabsContent>

        {/* Tab 5: Experience */}
        <TabsContent value="experience">
          {result.experience_analysis ? (
            <ExperienceCard data={result.experience_analysis} />
          ) : (
            <EmptyNode label="Experience Analyzer" />
          )}
        </TabsContent>

        {/* Tab 6: ATS Score */}
        <TabsContent value="ats" className="space-y-6">
          {result.ats_score ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <ATSScoreGauge score={result.ats_score.overall_score} />
                  </CardContent>
                </Card>
                <ScoreBreakdown breakdown={result.ats_score.breakdown} />
              </div>

              {result.ats_score.reasons.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-sm font-semibold mb-4 text-zinc-300">Score Reasoning</h3>
                    <div className="space-y-3">
                      {result.ats_score.reasons.map((reason, i) => (
                        <div key={i} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{reason.category}</span>
                            <span className="text-sm font-bold text-white">{reason.score}/100</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{reason.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptyNode label="ATS Scoring" />
          )}
        </TabsContent>

        {/* Tab 7: Interview */}
        <TabsContent value="interview">
          {result.interview_questions ? (
            <InterviewQuestions data={result.interview_questions} />
          ) : (
            <EmptyNode label="Interview Generator" />
          )}
        </TabsContent>

        {/* Tab 8: Career */}
        <TabsContent value="career">
          {result.hiring_readiness ? (
            <HiringReadiness data={result.hiring_readiness} />
          ) : (
            <EmptyNode label="Career Report" />
          )}
        </TabsContent>

        {/* Tab 9: Enhance */}
        <TabsContent value="enhance">
          {rewritten ? (
            <ResumeEditor data={rewritten} />
          ) : result.rewritten_resume ? (
            <ResumeEditor data={result.rewritten_resume} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center">
                  <PenLine className="h-7 w-7 text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-center max-w-sm">
                  Resume was not rewritten. Use the button above to generate improvements.
                </p>
                <Button onClick={handleRewrite} disabled={rewriting} className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
                  {rewriting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pen className="h-4 w-4" />
                  )}
                  Generate Improved Resume
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyNode({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <p className="text-zinc-500 text-sm">
          {label} did not produce output for this analysis
        </p>
      </CardContent>
    </Card>
  )
}
