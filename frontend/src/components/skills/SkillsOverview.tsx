import type { ResumeSkills } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu } from "lucide-react"

interface SkillsOverviewProps {
  data: ResumeSkills
}

const categories = [
  { key: "programming_languages" as const, label: "Languages", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { key: "frameworks" as const, label: "Frameworks", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { key: "libraries" as const, label: "Libraries", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { key: "databases" as const, label: "Databases", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { key: "cloud" as const, label: "Cloud", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { key: "ai_tools" as const, label: "AI/ML Tools", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { key: "developer_tools" as const, label: "Dev Tools", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  { key: "soft_skills" as const, label: "Soft Skills", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
]

export function SkillsOverview({ data }: SkillsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          Skills Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map(({ key, label, color }) => (
          <div key={key}>
            <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {data[key].map((skill) => (
                <span key={skill} className={`px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>
                  {skill}
                </span>
              ))}
              {data[key].length === 0 && (
                <span className="text-xs text-zinc-600">None detected</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
