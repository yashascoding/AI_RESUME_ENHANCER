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
} from "lucide-react"

export function Results() {
  const { result, rewritten, rewriting, runRewrite } = useAnalysis()
  const navigate = useNavigate()

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">No analysis results found</p>
        <Button onClick={() => navigate("/analyze")}>Run an Analysis</Button>
      </div>
    )
  }

  const handleRewrite = async () => {
    await runRewrite()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analysis Results</h1>
          <p className="text-sm text-muted-foreground">
            Complete pipeline output across all 9 nodes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/analyze")}>
            New Analysis
          </Button>
          <Button onClick={handleRewrite} disabled={rewriting} className="gap-2">
            {rewriting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pen className="h-4 w-4" />
            )}
            Enhance Resume
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="parsed" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Resume Parse
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="jd" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              JD Match
            </TabsTrigger>
            <TabsTrigger value="gap" className="gap-1.5">
              <GitCompareArrows className="h-3.5 w-3.5" />
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="ats" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              ATS Score
            </TabsTrigger>
            <TabsTrigger value="interview" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Interview
            </TabsTrigger>
            <TabsTrigger value="career" className="gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              Career
            </TabsTrigger>
            <TabsTrigger value="enhance" className="gap-1.5">
              <PenLine className="h-3.5 w-3.5" />
              Enhance
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardContent className="flex items-center justify-center py-8">
                {result.ats_score ? (
                  <ATSScoreGauge score={result.ats_score.overall_score} />
                ) : (
                  <span className="text-muted-foreground">No ATS score available</span>
                )}
              </CardContent>
            </Card>
            <div className="lg:col-span-2">
              {result.ats_score?.breakdown && (
                <ScoreBreakdown breakdown={result.ats_score.breakdown} />
              )}
            </div>
          </div>

          {result.final_report && (
            <OverallSummary summary={result.final_report.overall_summary} />
          )}

          <StrengthsWeaknesses
            strengths={result.strengths}
            weaknesses={result.weaknesses}
          />
        </TabsContent>

        {/* Tab 2: Parsed Resume (Node 1) */}
        <TabsContent value="parsed">
          {result.parsed_resume ? (
            <ParsedResumeCard data={result.parsed_resume} />
          ) : (
            <EmptyNode label="Resume Parser" />
          )}
        </TabsContent>

        {/* Tab 3: Skills (Node 2) */}
        <TabsContent value="skills">
          {result.resume_skills ? (
            <SkillsOverview data={result.resume_skills} />
          ) : (
            <EmptyNode label="Skill Extractor" />
          )}
        </TabsContent>

        {/* Tab 4: JD Skills (Node 4) */}
        <TabsContent value="jd">
          {result.jd_skills ? (
            <JDSkillsCard data={result.jd_skills} />
          ) : (
            <EmptyNode label="JD Skill Extractor" />
          )}
        </TabsContent>

        {/* Tab 5: Gap Analysis (Node 5) */}
        <TabsContent value="gap">
          <GapAnalysisTable
            matched={result.matched_skills}
            missing={result.missing_skills}
            missingKeywords={result.missing_keywords}
          />
          {result.recommendations.length > 0 && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <ul className="space-y-1.5">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 6: ATS Score (Node 6) */}
        <TabsContent value="ats" className="space-y-4">
          {result.ats_score ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <h4 className="text-sm font-medium mb-3">Score Reasoning</h4>
                    <div className="space-y-3">
                      {result.ats_score.reasons.map((reason, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{reason.category}</span>
                            <span className="text-sm font-bold">{reason.score}/100</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{reason.reason}</p>
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

        {/* Tab 7: Interview Questions (Node 8) */}
        <TabsContent value="interview">
          {result.interview_questions ? (
            <InterviewQuestions data={result.interview_questions} />
          ) : (
            <EmptyNode label="Interview Generator" />
          )}
        </TabsContent>

        {/* Tab 8: Career Readiness (Node 9) */}
        <TabsContent value="career">
          {result.hiring_readiness ? (
            <HiringReadiness data={result.hiring_readiness} />
          ) : (
            <EmptyNode label="Career Report" />
          )}
        </TabsContent>

        {/* Tab 9: Enhanced Resume (Node 7) */}
        <TabsContent value="enhance">
          {rewritten ? (
            <ResumeEditor data={rewritten} />
          ) : result.rewritten_resume ? (
            <ResumeEditor data={result.rewritten_resume} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <PenLine className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Resume was not rewritten (ATS score was above 75)
                </p>
                <Button onClick={handleRewrite} disabled={rewriting} className="gap-2">
                  {rewriting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pen className="h-4 w-4" />
                  )}
                  Force Enhancement
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
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">
          {label} did not produce output for this analysis
        </p>
      </CardContent>
    </Card>
  )
}
