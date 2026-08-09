import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface JDInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function JDInput({ value, onChange, disabled }: JDInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Job Description</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Paste the job description here..."
          className="min-h-[200px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  )
}
