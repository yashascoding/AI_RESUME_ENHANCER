import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAnalysis } from "@/hooks/useAnalysis"
import { listAnalyses, type AnalysisHistoryItem } from "@/api/client"
import {
  FileSearch,
  ArrowRight,
  BarChart3,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react"

export function Dashboard() {
  const { loadAnalysis } = useAnalysis()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAnalyses()
      setAnalyses(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load analyses")
    } finally {
      setLoading(false)
    }
  }

  const handleViewAnalysis = async (id: string) => {
    await loadAnalysis(id)
    navigate("/results")
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500">Your previous resume analyses</p>
        </div>
        <Link to="/analyze">
          <Button className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
            <FileSearch className="h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin" />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-4">
            <p className="text-sm text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && analyses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-center max-w-sm">
              No analyses yet. Upload your resume and a job description to get started.
            </p>
            <Link to="/analyze">
              <Button className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
                <FileSearch className="h-4 w-4" />
                Run Your First Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Analysis List */}
      {!loading && analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((item) => (
            <Card
              key={item.id}
              className="hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => handleViewAnalysis(item.id)}
            >
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.candidate_name || "Resume Analysis"}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        ATS: {Math.round(item.ats_score)}/100
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
