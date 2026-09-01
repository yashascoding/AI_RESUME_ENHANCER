import type { ATSBreakdown } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreBreakdownProps {
  breakdown: ATSBreakdown
}

const labels: Record<keyof ATSBreakdown, string> = {
  skills_score: "Skills Match",
  projects_score: "Project Quality",
  experience_score: "Experience Relevance",
  keywords_score: "Keyword Match",
  achievements_score: "Achievement Strength",
  formatting_score: "Formatting",
}

const barColors: Record<keyof ATSBreakdown, string> = {
  skills_score: "bg-indigo-500",
  projects_score: "bg-purple-500",
  experience_score: "bg-emerald-500",
  keywords_score: "bg-amber-500",
  achievements_score: "bg-rose-500",
  formatting_score: "bg-cyan-500",
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(labels) as (keyof ATSBreakdown)[]).map((key) => (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{labels[key]}</span>
              <span className="font-medium text-white">{breakdown[key]}<span className="text-zinc-600">/100</span></span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${barColors[key]}`}
                style={{ width: `${breakdown[key]}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
