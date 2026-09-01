import type { ExperienceAnalysis } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, CheckCircle2, AlertTriangle } from "lucide-react"

interface ExperienceCardProps {
  data: ExperienceAnalysis
}

const metrics = [
  { key: "project_quality" as const, label: "Project Quality" },
  { key: "internship_relevance" as const, label: "Internship Relevance" },
  { key: "open_source" as const, label: "Open Source" },
  { key: "leadership" as const, label: "Leadership" },
  { key: "quantified_achievements" as const, label: "Quantified Achievements" },
  { key: "action_verbs" as const, label: "Action Verbs" },
  { key: "business_impact" as const, label: "Business Impact" },
  { key: "readability" as const, label: "Readability" },
  { key: "formatting" as const, label: "Formatting" },
]

export function ExperienceCard({ data }: ExperienceCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-400" />
            Experience Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.map(({ key, label }) => (
            <div key={key} className="flex items-start gap-3 py-1.5">
              <span className="text-sm text-zinc-400 min-w-[180px]">{label}</span>
              <span className="text-sm text-zinc-300">{data[key]}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.strengths.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.weaknesses.map((w, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {w}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
