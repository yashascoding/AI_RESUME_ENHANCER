import type { HiringReadiness } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Lightbulb, Briefcase, CheckCircle2 } from "lucide-react"

interface HiringReadinessProps {
  data: HiringReadiness
}

function ReadinessBadge({ label, value }: { label: string; value: string }) {
  const color =
    value === "Ready"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : value === "Almost Ready"
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20"

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
      <span className="text-sm text-zinc-400">{label}</span>
      <Badge variant="secondary" className={`border ${color}`}>{value}</Badge>
    </div>
  )
}

export function HiringReadiness({ data }: HiringReadinessProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Hiring Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-zinc-400">Readiness Score</span>
              <span className="text-sm font-bold text-white">{data.readiness_score}/100</span>
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
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.top_strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-zinc-300">{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Priority Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.high_priority_improvements.map((imp, i) => (
                <li key={i} className="text-sm flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-zinc-300">{imp}</span>
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
              <Briefcase className="h-4 w-4 text-indigo-400" />
              Suggested Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.suggested_roles.map((role) => (
                <span key={role} className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {role}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
