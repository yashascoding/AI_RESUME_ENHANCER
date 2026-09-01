import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface GapAnalysisTableProps {
  matched: string[]
  missing: string[]
  missingKeywords: string[]
}

export function GapAnalysisTable({ matched, missing, missingKeywords }: GapAnalysisTableProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="text-sm font-medium mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Matched Skills
              <span className="text-zinc-600 font-normal">({matched.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {matched.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {skill}
                </span>
              ))}
              {matched.length === 0 && (
                <span className="text-xs text-zinc-600">No matching skills found</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2.5 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              Missing Skills
              <span className="text-zinc-600 font-normal">({missing.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  {skill}
                </span>
              ))}
              {missing.length === 0 && (
                <span className="text-xs text-zinc-600">No missing skills</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Missing ATS Keywords
              <span className="text-zinc-600 font-normal">({missingKeywords.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw) => (
                <span key={kw} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {kw}
                </span>
              ))}
              {missingKeywords.length === 0 && (
                <span className="text-xs text-zinc-600">No missing keywords</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
