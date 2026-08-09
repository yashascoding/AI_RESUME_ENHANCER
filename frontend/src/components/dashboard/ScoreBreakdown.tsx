import type { ATSBreakdown } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreBreakdownProps {
  breakdown: ATSBreakdown
}

const labels: Record<keyof ATSBreakdown, string> = {
  skills_score: "Skills",
  projects_score: "Projects",
  experience_score: "Experience",
  keywords_score: "Keywords",
  achievements_score: "Achievements",
  formatting_score: "Formatting",
}

const colors: Record<keyof ATSBreakdown, string> = {
  skills_score: "bg-blue-500",
  projects_score: "bg-purple-500",
  experience_score: "bg-green-500",
  keywords_score: "bg-orange-500",
  achievements_score: "bg-pink-500",
  formatting_score: "bg-cyan-500",
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(labels) as (keyof ATSBreakdown)[]).map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{labels[key]}</span>
              <span className="font-medium">{breakdown[key]}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colors[key]}`}
                style={{ width: `${breakdown[key]}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
