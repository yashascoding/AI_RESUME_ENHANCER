import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileSearch,
  ArrowRight,
  BarChart3,
  Target,
  MessageSquare,
  PenLine,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { useAnalysis } from "@/hooks/useAnalysis"

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

const steps = [
  { num: 1, title: "Upload Resume", description: "Drop your PDF or paste text" },
  { num: 2, title: "Match Job Description", description: "Paste the target role" },
  { num: 3, title: "AI Analysis", description: "9-node pipeline processes" },
  { num: 4, title: "Review Results", description: "ATS score, skills, gaps" },
  { num: 5, title: "Improve & Prepare", description: "Rewrite and interview prep" },
]

export function Dashboard() {
  const { result } = useAnalysis()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f0f12] p-8 lg:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            AI Resume Enhancer
          </h1>
          <p className="text-zinc-400 max-w-lg mb-6">
            Optimize your resume for the roles you actually want. Powered by a 9-node LangGraph AI pipeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/analyze">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-200 gap-2">
                <FileSearch className="h-4 w-4" />
                Start New Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {result && (
              <Link to="/results">
                <Button variant="outline" size="lg" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Last Results
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pipeline Nodes", value: "9", icon: Sparkles, color: "text-indigo-400" },
          { label: "Data Models", value: "16", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Question Categories", value: "4", icon: MessageSquare, color: "text-amber-400" },
          { label: "Analysis Steps", value: "5", icon: CheckCircle2, color: "text-rose-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-lg font-semibold mb-4">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map((step, i) => (
            <div key={step.num} className="relative p-4 rounded-xl border border-zinc-800 bg-[#0f0f12]">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-6 w-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {step.num}
                </span>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block flex-1 h-px bg-zinc-800" />
                )}
              </div>
              <p className="text-sm font-medium mb-0.5">{step.title}</p>
              <p className="text-xs text-zinc-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="group p-5 rounded-xl border border-zinc-800 bg-[#0f0f12] hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                  <feature.icon className="h-4 w-4 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
