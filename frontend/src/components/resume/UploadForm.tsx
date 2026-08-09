import { useCallback, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, Loader2 } from "lucide-react"

interface UploadFormProps {
  onResumeText: (text: string) => void
  disabled?: boolean
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist")
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const textParts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item: any) => item.str).join(" ")
    textParts.push(pageText)
  }

  return textParts.join("\n\n")
}

export function UploadForm({ onResumeText, disabled }: UploadFormProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name)
      setExtracting(true)
      try {
        let text: string
        if (file.name.endsWith(".pdf")) {
          text = await extractPdfText(file)
        } else {
          text = await file.text()
        }
        onResumeText(text)
      } catch (err) {
        console.error("Failed to extract text:", err)
        onResumeText("")
        setFileName(null)
      } finally {
        setExtracting(false)
      }
    },
    [onResumeText]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const clearFile = () => {
    setFileName(null)
    onResumeText("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resume</CardTitle>
      </CardHeader>
      <CardContent>
        {fileName ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            {extracting ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            ) : (
              <FileText className="h-8 w-8 text-blue-500" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {extracting ? "Extracting text..." : "File loaded"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile} disabled={disabled || extracting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Drop your resume here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Supports PDF and TXT</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </CardContent>
    </Card>
  )
}
