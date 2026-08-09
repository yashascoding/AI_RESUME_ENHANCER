import type { JDSkills } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
            <Target className="h-5 w-5" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.required_skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-red-100 text-red-800">
                {skill}
              </Badge>
            ))}
            {data.required_skills.length === 0 && (
              <span className="text-xs text-muted-foreground">None specified</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Preferred Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.preferred_skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                {skill}
              </Badge>
            ))}
            {data.preferred_skills.length === 0 && (
              <span className="text-xs text-muted-foreground">None specified</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            ATS Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {data.ats_keywords.map((kw) => (
              <Badge key={kw} variant="outline">{kw}</Badge>
            ))}
            {data.ats_keywords.length === 0 && (
              <span className="text-xs text-muted-foreground">None detected</span>
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
            <ul className="space-y-1.5">
              {data.responsibilities.map((r, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
