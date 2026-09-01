import type { RewrittenResume as RewrittenResumeType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PenLine, ArrowRight } from "lucide-react"

interface ResumeEditorProps {
  data: RewrittenResumeType
}

export function ResumeEditor({ data }: ResumeEditorProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PenLine className="h-5 w-5 text-indigo-400" />
            Resume Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400">{data.changes_summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="diff">
            <TabsList>
              <TabsTrigger value="diff">Section Changes</TabsTrigger>
              <TabsTrigger value="full">Full Resume</TabsTrigger>
            </TabsList>

            <TabsContent value="diff" className="space-y-4 mt-4">
              {data.rewritten_sections.map((section, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">{section.section}</CardTitle>
                      <Badge variant="info">Modified</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wider">Original</p>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{section.original}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-1.5 mb-2">
                          <ArrowRight className="h-3 w-3 text-emerald-400" />
                          <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Improved</p>
                        </div>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{section.improved}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3 italic">
                      {section.changes_made}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="full" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <ScrollArea className="max-h-[500px]">
                    <pre className="text-sm whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed">
                      {data.full_improved_resume}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
