import { useState } from "react"
import type { InterviewQuestion } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface QuestionCardProps {
  question: InterviewQuestion
}

const difficultyColors = {
  easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-[#0f0f12] overflow-hidden transition-colors hover:border-zinc-700"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left cursor-pointer"
      >
        <p className="text-sm font-medium leading-relaxed text-zinc-200">{question.question}</p>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className={cn("border", difficultyColors[question.difficulty])}>
            {question.difficulty}
          </Badge>
          <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", expanded && "rotate-180")} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3 animate-fade-in">
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-zinc-500 font-medium">Category: </span>
              <span className="text-zinc-300">{question.category}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Focus: </span>
              <span className="text-zinc-300">{question.focus}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
