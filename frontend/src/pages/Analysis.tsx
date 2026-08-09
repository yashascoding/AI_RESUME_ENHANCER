import { useNavigate } from "react-router-dom"
import { UploadForm } from "@/components/resume/UploadForm"
import { JDInput } from "@/components/resume/JDInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAnalysis } from "@/hooks/useAnalysis"
import { Play, Loader2, ArrowRight } from "lucide-react"

export function Analysis() {
  const {
    resumeText,
    jobDescription,
    setResumeText,
    setJobDescription,
    result,
    loading,
    error,
    step,
    runAnalysis,
  } = useAnalysis()
  const navigate = useNavigate()

  const canSubmit = resumeText.trim().length > 0 && jobDescription.trim().length > 0 && !loading

  const handleSubmit = async () => {
    await runAnalysis(resumeText, jobDescription)
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-green-500 mb-4">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Analysis Complete</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your resume has been analyzed through all 9 pipeline nodes
            </p>
            <Button onClick={() => navigate("/results")} className="gap-2">
              View Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Analyze Resume</h1>
        <p className="text-sm text-muted-foreground">
          Upload your resume and paste the job description to get a comprehensive AI analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadForm onResumeText={setResumeText} disabled={loading} />
        <JDInput value={jobDescription} onChange={setJobDescription} disabled={loading} />
      </div>

      {loading && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{step || "Processing..."}</span>
              </div>
              <Progress value={30} className="animate-pulse" />
              <p className="text-xs text-muted-foreground">
                Running through 9 AI analysis nodes...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {loading ? "Analyzing..." : "Run Full Analysis"}
        </Button>
      </div>
    </div>
  )
}
