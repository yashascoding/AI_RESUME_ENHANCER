import type { HiringReadiness } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Lightbulb, Briefcase } from "lucide-react"

interface HiringReadinessProps {
  data: HiringReadiness
}

function ReadinessBadge({ label, value }: { label: string; value: string }) {
  const color =
    value === "Ready"
      ? "bg-green-100 text-green-800"
      : value === "Almost Ready"
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800"

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant="secondary" className={color}>{value}</Badge>
    </div>
  )
}

export function HiringReadiness({ data }: HiringReadinessProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Hiring Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Readiness Score</span>
              <span className="text-sm font-bold">{data.readiness_score}/100</span>
            </div>
            <Progress value={data.readiness_score} />
          </div>

          <ReadinessBadge label="Internship Readiness" value={data.internship_readiness} />
          <ReadinessBadge label="SDE-1 Readiness" value={data.sde1_readiness} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {data.top_strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Priority Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {data.high_priority_improvements.map((imp, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  {imp}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {data.suggested_roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Suggested Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.suggested_roles.map((role) => (
                <Badge key={role} variant="secondary" className="bg-blue-100 text-blue-800">
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
