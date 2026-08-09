import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileSearch,
  BarChart3,
  MessageSquare,
  PenLine,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react"

const features = [
  {
    icon: FileSearch,
    title: "Resume Parsing",
    description: "AI-powered extraction of structured data from your resume",
  },
  {
    icon: Target,
    title: "Skills Gap Analysis",
    description: "Compare your skills against job requirements",
  },
  {
    icon: BarChart3,
    title: "ATS Scoring",
    description: "Get your resume scored against Applicant Tracking Systems",
  },
  {
    icon: PenLine,
    title: "Resume Enhancement",
    description: "AI-driven rewriting to improve weak sections",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Generate targeted interview questions based on your profile",
  },
  {
    icon: Sparkles,
    title: "Career Readiness",
    description: "Comprehensive hiring readiness assessment",
  },
]

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Powered by LangGraph multi-agent pipeline. Get comprehensive resume analysis,
          ATS scoring, skills gap analysis, and AI-powered improvement suggestions.
        </p>
        <Link to="/analyze">
          <Button size="lg" className="gap-2">
            <FileSearch className="h-5 w-5" />
            Start New Analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="grid grid-cols-3 gap-8 text-center mb-6">
            <div>
              <div className="text-2xl font-bold">9</div>
              <div className="text-xs text-muted-foreground">Analysis Nodes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">16</div>
              <div className="text-xs text-muted-foreground">Data Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-muted-foreground">Question Categories</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Each analysis runs through 9 specialized AI nodes for comprehensive results
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
