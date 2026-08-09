import type { InterviewQuestions as InterviewQuestionsType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionCard } from "./QuestionCard"
import { MessageSquare } from "lucide-react"

interface InterviewQuestionsProps {
  data: InterviewQuestionsType
}

export function InterviewQuestions({ data }: InterviewQuestionsProps) {
  const sections = [
    { key: "resume", label: "Resume", questions: data.resume_questions },
    { key: "technical", label: "Technical", questions: data.technical_questions },
    { key: "behavioral", label: "Behavioral", questions: data.behavioral_questions },
    { key: "project", label: "Project Deep Dive", questions: data.project_deep_dive },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Interview Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resume">
          <TabsList>
            {sections.map((s) => (
              <TabsTrigger key={s.key} value={s.key}>
                {s.label} ({s.questions.length})
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((s) => (
            <TabsContent key={s.key} value={s.key} className="space-y-3 mt-4">
              {s.questions.map((q, i) => (
                <QuestionCard key={i} question={q} />
              ))}
              {s.questions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {s.label.toLowerCase()} questions generated
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
