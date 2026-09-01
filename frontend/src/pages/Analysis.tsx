import { useNavigate } from "react-router-dom"
import { UploadForm } from "@/components/resume/UploadForm"
import { JDInput } from "@/components/resume/JDInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAnalysis } from "@/hooks/useAnalysis"
import { Play, Loader2, ArrowRight, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react"

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
    reset,
  } = useAnalysis()
  const navigate = useNavigate()

  const canSubmit = resumeText.trim().length > 0 && jobDescription.trim().length > 0 && !loading

  const handleSubmit = async () => {
    await runAnalysis(resumeText, jobDescription)
  }

  const handleNewAnalysis = () => {
    reset()
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Analysis Complete</h2>
            <p className="text-sm text-zinc-400 mb-6 text-center max-w-sm">
              Your resume has been analyzed. Review your results or start a new analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate("/results")} className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
                View Results
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleNewAnalysis} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">New Analysis</h1>
        <p className="text-sm text-zinc-400">
          Upload your resume and paste the job description to get a comprehensive AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadForm onResumeText={setResumeText} disabled={loading} />
        <JDInput value={jobDescription} onChange={setJobDescription} disabled={loading} />
      </div>

      {loading && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-sm font-medium">{step || "Processing..."}</p>
                  <p className="text-xs text-zinc-500">2-3 AI calls, typically 15-30 seconds</p>
                </div>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full animate-[progress-fill_8s_ease-in-out_forwards]" style={{ width: "100%" }} />
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                This typically takes 15-30 seconds
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">Analysis failed</p>
                <p className="text-xs text-zinc-500 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button
          size="xl"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500"
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
