import type { InterviewQuestion } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: InterviewQuestion
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-red-100 text-red-800",
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium leading-relaxed">{question.question}</p>
          <Badge variant="secondary" className={cn("shrink-0", difficultyColors[question.difficulty])}>
            {question.difficulty}
          </Badge>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>Category: {question.category}</span>
          <span>|</span>
          <span>Focus: {question.focus}</span>
        </div>
      </CardContent>
    </Card>
  )
}
