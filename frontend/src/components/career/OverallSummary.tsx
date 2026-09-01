import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

interface OverallSummaryProps {
  summary: string
}

export function OverallSummary({ summary }: OverallSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          Overall Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px]">
          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{summary}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
