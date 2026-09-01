import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAnalysis } from "@/hooks/useAnalysis"
import { listAnalyses, deleteAnalysis, getAnalysisCount, type AnalysisHistoryItem } from "@/api/client"
import {
  FileSearch,
  ArrowRight,
  BarChart3,
  Loader2,
  Calendar,
  TrendingUp,
  Trash2,
  AlertCircle,
  Sparkles,
} from "lucide-react"

export function Dashboard() {
  const { loadAnalysis } = useAnalysis()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tierInfo, setTierInfo] = useState({ count: 0, limit: 2, is_pro: false })
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [analysesData, tierData] = await Promise.all([
        listAnalyses(),
        getAnalysisCount(),
      ])
      setAnalyses(analysesData)
      setTierInfo(tierData)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleViewAnalysis = async (id: string) => {
    await loadAnalysis(id)
    navigate("/results")
  }

  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this analysis?")) return
    setDeleting(id)
    try {
      await deleteAnalysis(id)
      setAnalyses(analyses.filter(a => a.id !== id))
      setTierInfo(prev => ({ ...prev, count: Math.max(0, prev.count - 1) }))
    } catch (err: any) {
      setError("Failed to delete analysis")
    } finally {
      setDeleting(null)
    }
  }

  const handleNewAnalysis = () => {
    if (!tierInfo.is_pro && tierInfo.count >= tierInfo.limit) {
      setShowUpgrade(true)
    } else {
      navigate("/analyze")
    }
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
          <p className="text-sm text-zinc-500">
            {tierInfo.is_pro
              ? "Pro account — unlimited analyses"
              : `${tierInfo.count}/${tierInfo.limit} free analyses used`}
          </p>
        </div>
        <Button onClick={handleNewAnalysis} className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
          <FileSearch className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Free Tier Warning */}
      {!tierInfo.is_pro && tierInfo.count >= tierInfo.limit - 1 && tierInfo.count < tierInfo.limit && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Almost at free tier limit</p>
              <p className="text-xs text-zinc-500 mt-1">
                You have {tierInfo.limit - tierInfo.count} free analysis remaining. Upgrade to Pro for unlimited analyses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Button onClick={handleNewAnalysis} className="gap-2 bg-white text-zinc-900 hover:bg-zinc-200">
              <FileSearch className="h-4 w-4" />
              Run Your First Analysis
            </Button>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDeleteAnalysis(item.id, e)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-md text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label="Delete analysis"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                  <ArrowRight className="h-4 w-4 text-zinc-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full mx-4 animate-fade-in">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Free Trial Over</h2>
              <p className="text-sm text-zinc-400">
                You've used all {tierInfo.limit} free analyses. Upgrade to continue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Option */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#09090b]">
                <h3 className="font-semibold mb-2">Continue Free</h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Keep using existing features with current limitations.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowUpgrade(false)
                    // Still can't analyze, just close modal
                  }}
                >
                  Current Plan
                </Button>
              </div>

              {/* Pro Option */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 relative">
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                  RECOMMENDED
                </div>
                <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">₹100</span>
                  <span className="text-xs text-zinc-500">/one-time</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 mb-4">
                  <li>• Unlimited analyses</li>
                  <li>• Generate new resume from scratch</li>
                  <li>• Advanced ATS optimization</li>
                  <li>• Priority processing</li>
                </ul>
                <Button
                  className="w-full bg-white text-zinc-900 hover:bg-zinc-200"
                  onClick={() => {
                    setShowUpgrade(false)
                    alert("Pro upgrade coming soon! This is a demo.")
                  }}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>

            <button
              onClick={() => setShowUpgrade(false)}
              className="mt-4 w-full text-center text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
