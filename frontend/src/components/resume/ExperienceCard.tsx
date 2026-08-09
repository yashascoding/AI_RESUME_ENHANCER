import type { ExperienceAnalysis } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, CheckCircle, AlertTriangle } from "lucide-react"

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
            <Briefcase className="h-5 w-5" />
            Experience Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.map(({ key, label }) => (
            <div key={key} className="flex items-start gap-3">
              <span className="text-sm font-medium min-w-[160px]">{label}</span>
              <span className="text-sm text-muted-foreground">{data[key]}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.strengths.map((s, i) => (
                <Badge key={i} variant="secondary" className="bg-green-100 text-green-800">
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.weaknesses.map((w, i) => (
                <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800">
                  {w}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
