import type { ResumeSkills } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu } from "lucide-react"

interface SkillsOverviewProps {
  data: ResumeSkills
}

const categories = [
  { key: "programming_languages" as const, label: "Languages", color: "bg-blue-100 text-blue-800" },
  { key: "frameworks" as const, label: "Frameworks", color: "bg-purple-100 text-purple-800" },
  { key: "libraries" as const, label: "Libraries", color: "bg-pink-100 text-pink-800" },
  { key: "databases" as const, label: "Databases", color: "bg-green-100 text-green-800" },
  { key: "cloud" as const, label: "Cloud", color: "bg-cyan-100 text-cyan-800" },
  { key: "ai_tools" as const, label: "AI/ML Tools", color: "bg-orange-100 text-orange-800" },
  { key: "developer_tools" as const, label: "Dev Tools", color: "bg-gray-100 text-gray-800" },
  { key: "soft_skills" as const, label: "Soft Skills", color: "bg-amber-100 text-amber-800" },
]

export function SkillsOverview({ data }: SkillsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Skills Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(({ key, label, color }) => (
          <div key={key}>
            <p className="text-sm font-medium mb-1.5">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {data[key].map((skill) => (
                <Badge key={skill} variant="secondary" className={color}>
                  {skill}
                </Badge>
              ))}
              {data[key].length === 0 && (
                <span className="text-xs text-muted-foreground">None detected</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
