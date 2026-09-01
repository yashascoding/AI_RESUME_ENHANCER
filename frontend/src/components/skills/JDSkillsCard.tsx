import type { JDSkills } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ListChecks, Search } from "lucide-react"

interface JDSkillsCardProps {
  data: JDSkills
}

export function JDSkillsCard({ data }: JDSkillsCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-red-400" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.required_skills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                {skill}
              </span>
            ))}
            {data.required_skills.length === 0 && (
              <span className="text-xs text-zinc-600">None specified</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-indigo-400" />
            Preferred Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.preferred_skills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {skill}
              </span>
            ))}
            {data.preferred_skills.length === 0 && (
              <span className="text-xs text-zinc-600">None specified</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-400" />
            ATS Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.ats_keywords.map((kw) => (
              <span key={kw} className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                {kw}
              </span>
            ))}
            {data.ats_keywords.length === 0 && (
              <span className="text-xs text-zinc-600">None detected</span>
            )}
          </div>
        </CardContent>
      </Card>

      {data.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.responsibilities.map((r, i) => (
                <li key={i} className="text-sm flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-400 shrink-0" />
                  <span className="text-zinc-300">{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
