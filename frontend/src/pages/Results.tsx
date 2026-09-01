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
import { ResumeEditor } from "@/components/resume/ResumeEditor"
import { InterviewQuestions } from "@/components/interview/InterviewQuestions"
import {
  BarChart3,
  FileText,
  GitCompareArrows,
  PenLine,
  MessageSquare,
  Loader2,
  Pen,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
} from "lucide-react"

export function Results() {
  const { result, rewritten, rewriting, runRewrite, reset } = useAnalysis()
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
        </div>
        <div className="flex gap-2 ml-9 sm:ml-0">
          <Button
            variant="outline"
            onClick={() => { reset(); navigate("/analyze") }}
            className="gap-2"
          >
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
            <TabsTrigger value="gap" className="gap-1.5">
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Gap Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger value="enhance" className="gap-1.5">
              <PenLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Enhance</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* ATS Score + Breakdown */}
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

          {/* Score Reasons */}
          {result.ats_score?.reasons && result.ats_score.reasons.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3 text-zinc-300">Score Breakdown</h3>
                <div className="space-y-2">
                  {result.ats_score.reasons.map((reason, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-400">{reason.category}</span>
                      <span className="text-sm font-bold text-white">{reason.score}/100</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths & Weaknesses */}
          {(result.strengths.length > 0 || result.weaknesses.length > 0) && (
            <StrengthsWeaknesses
              strengths={result.strengths}
              weaknesses={result.weaknesses}
            />
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3 text-zinc-300 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Recommendations
                </h3>
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

        {/* Tab 3: Gap Analysis */}
        <TabsContent value="gap" className="space-y-6">
          <GapAnalysisTable
            matched={result.matched_skills}
            missing={result.missing_skills}
            missingKeywords={result.missing_keywords}
          />
        </TabsContent>

        {/* Tab 4: Interview */}
        <TabsContent value="interview">
          {result.interview_questions ? (
            <InterviewQuestions data={result.interview_questions} />
          ) : (
            <EmptyNode label="Interview Generator" />
          )}
        </TabsContent>

        {/* Tab 5: Enhance */}
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
