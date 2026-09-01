import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface JDInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function JDInput({ value, onChange, disabled }: JDInputProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Target Job Description</CardTitle>
          {value.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              disabled={disabled}
              className="gap-1 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Paste the job description here..."
          className="min-h-[280px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>{value.length} characters</span>
          <span>Paste the full job posting for best results</span>
        </div>
      </CardContent>
    </Card>
  )
}
