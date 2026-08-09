import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

interface GapAnalysisTableProps {
  matched: string[]
  missing: string[]
  missingKeywords: string[]
}

export function GapAnalysisTable({ matched, missing, missingKeywords }: GapAnalysisTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Matched Skills ({matched.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800">
                {skill}
              </Badge>
            ))}
            {matched.length === 0 && (
              <span className="text-xs text-muted-foreground">No matching skills found</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            Missing Skills ({missing.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-red-100 text-red-800">
                {skill}
              </Badge>
            ))}
            {missing.length === 0 && (
              <span className="text-xs text-muted-foreground">No missing skills</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-amber-500" />
            Missing ATS Keywords ({missingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="bg-amber-100 text-amber-800">
                {kw}
              </Badge>
            ))}
            {missingKeywords.length === 0 && (
              <span className="text-xs text-muted-foreground">No missing keywords</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
