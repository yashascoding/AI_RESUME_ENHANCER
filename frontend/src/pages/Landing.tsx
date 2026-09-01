import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  FileSearch,
  BarChart3,
  Target,
  PenLine,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Upload,
  GitCompareArrows,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { useEffect, useState } from "react"

function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return { ref: setRef as React.Ref<HTMLDivElement>, inView }
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView(0.5)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count}</span>
}

const features = [
  {
    icon: FileSearch,
    title: "ATS Intelligence",
    description: "Understand how well your resume aligns with applicant tracking systems before you apply.",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Compare your skills against any job requirement. See matched, partial, and missing skills instantly.",
  },
  {
    icon: BarChart3,
    title: "Experience Analysis",
    description: "Evaluate how strongly your projects and work experience support the target role.",
  },
  {
    icon: PenLine,
    title: "AI Resume Rewriter",
    description: "Turn weak resume bullets into stronger, impact-focused statements that get noticed.",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Generate technical, behavioral, and project-based interview questions from your resume.",
  },
  {
    icon: Sparkles,
    title: "Career Readiness",
    description: "Get a hiring-readiness score and prioritized next steps for your career goals.",
  },
]

const steps = [
  { num: "01", title: "Upload", description: "Upload your resume or paste the text directly.", icon: Upload },
  { num: "02", title: "Match", description: "Add the job description you're targeting.", icon: Target },
  { num: "03", title: "Analyze", description: "AI analyzes skills, experience, keywords, and ATS compatibility.", icon: Zap },
  { num: "04", title: "Improve", description: "Get prioritized recommendations and AI-powered rewrites.", icon: PenLine },
  { num: "05", title: "Prepare", description: "Generate targeted interview questions based on your profile.", icon: MessageSquare },
]

const capabilities = [
  "ATS Analysis",
  "Skill Intelligence",
  "Resume Optimization",
  "Interview Preparation",
]

const problems = [
  {
    title: "ATS Blind Spots",
    description: "You may have the right experience but still miss important keywords and requirements that ATS systems filter for.",
    icon: FileSearch,
  },
  {
    title: "Hidden Skill Gaps",
    description: "Discover the skills your target role expects that your resume doesn't clearly demonstrate.",
    icon: Target,
  },
  {
    title: "Weak Resume Evidence",
    description: "Identify vague bullets, missing metrics, and experience that isn't communicating enough impact.",
    icon: BarChart3,
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
            <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-zinc-900" />
            </div>
            <span>AI Resume Enhancer</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#product" className="text-sm text-zinc-400 hover:text-white transition-colors">Product</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link to="/analyze">
              <Button size="sm" className="bg-white text-zinc-900 hover:bg-zinc-200">
                Analyze My Resume
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700/50 bg-zinc-800/50 text-xs font-medium text-zinc-400">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  AI-POWERED CAREER INTELLIGENCE
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  Turn your resume into{" "}
                  <span className="text-zinc-400">your strongest</span>{" "}
                  application.
                </h1>

                <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
                  Analyze your resume against any job description, discover what recruiters and ATS systems are looking for, and get actionable improvements in seconds.
                </p>
              </div>

              <div>
                <Link to="/analyze">
                  <Button size="xl" className="bg-white text-zinc-900 hover:bg-zinc-200">
                    Analyze My Resume
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {capabilities.map((cap, i) => (
                  <span key={cap} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {cap}
                    {i < capabilities.length - 1 && <span className="text-zinc-700">·</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Product Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10 rounded-2xl blur-2xl" />
              <div className="relative bg-[#0f0f12] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="ml-auto text-xs text-zinc-600 font-medium">Resume Analysis</div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * 78) / 100} className="animate-[score-count_1s_ease-out_0.3s_forwards] [stroke-dashoffset:264]" style={{ strokeDashoffset: 264 - (264 * 78) / 100 } as React.CSSProperties} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold animate-score">78</span>
                        <span className="text-[10px] text-zinc-500">/100</span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 mt-2 font-medium">ATS Readiness</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {[
                      { label: "Keyword Match", value: 82 },
                      { label: "Skills Match", value: 81 },
                      { label: "Experience", value: 74 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">{item.label}</span>
                          <span className="text-zinc-300 font-medium">{item.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500 animate-progress" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500 mb-2 font-medium">Matched Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-400/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      3 opportunities detected
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">Missing: AWS, Kubernetes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
          <p className="text-center text-xs text-zinc-500 font-medium uppercase tracking-widest mb-4">
            Built for modern job seekers
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-sm text-zinc-400">
                <Zap className="h-4 w-4 text-indigo-400" />
                {cap}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Your resume shouldn't be a guessing game.
            </h2>
            <p className="text-zinc-400 text-lg">
              Most candidates tailor resumes by intuition. AI Resume Enhancer shows exactly where your resume aligns with a role — and where it falls short.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <div key={problem.title} className="group p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] hover:border-zinc-700 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                  <problem.icon className="h-5 w-5 text-zinc-300" />
                </div>
                <h3 className="text-base font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              From resume to interview-ready.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              One workflow. Everything you need to tailor your application.
            </p>
          </div>

          {/* Desktop: horizontal flow */}
          <div className="hidden md:grid grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-px bg-zinc-800" />
                  )}
                </div>
                <h3 className="text-base font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile: vertical flow */}
          <div className="md:hidden space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-zinc-800 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="text-base font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/analyze">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-200">
                Start Your Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="product" className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Understand exactly how your resume performs.
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Stop wondering whether your resume is good enough. See exactly what is working, what is missing, and what you should improve before applying.
              </p>

              <div className="space-y-4">
                {[
                  { label: "ATS Score", desc: "Compatibility with applicant tracking systems", color: "text-indigo-400" },
                  { label: "Skill Matching", desc: "Compare your skills against job requirements", color: "text-emerald-400" },
                  { label: "Gap Analysis", desc: "Identify missing keywords and skills", color: "text-amber-400" },
                  { label: "Resume Rewriting", desc: "AI-powered improvement of weak sections", color: "text-rose-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                    <ChevronRight className={`h-5 w-5 mt-0.5 ${item.color} shrink-0`} />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 rounded-2xl blur-2xl" />
              <div className="relative bg-[#0f0f12] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <div className="relative">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="5" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * 78) / 100} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">78</span>
                        <span className="text-[9px] text-zinc-500">/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">ATS Readiness</p>
                      <p className="text-xs text-zinc-500">Good — your resume is competitive</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Keyword Match", value: 82 },
                    { label: "Skills Match", value: 81 },
                    { label: "Experience Relevance", value: 74 },
                    { label: "Formatting", value: 89 },
                    { label: "Achievement Strength", value: 68 },
                    { label: "Job Alignment", value: 76 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="text-zinc-300 font-medium">{item.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500/70" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Everything you need to build a stronger application.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              A complete toolkit for understanding and improving your resume.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] hover:border-zinc-700 transition-all duration-200">
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 transition-colors">
                  <feature.icon className="h-5 w-5 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS Score Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative bg-[#0f0f12] border border-zinc-800 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="4" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * 78) / 100} />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%-1rem)] flex flex-col items-center">
                    <span className="text-5xl font-bold tracking-tight">78</span>
                    <span className="text-sm text-zinc-500 mt-1">ATS Readiness</span>
                    <span className="text-xs text-zinc-600">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { label: "Keyword Match", value: "82%" },
                    { label: "Skills Match", value: "81%" },
                    { label: "Experience", value: "74%" },
                    { label: "Formatting", value: "89%" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-lg bg-zinc-800/50">
                      <p className="text-lg font-bold">{item.value}</p>
                      <p className="text-xs text-zinc-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Know your score before the recruiter does.
              </h2>
              <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                Your score isn't just a number. It tells you where your resume is aligned — and where you can improve before submitting.
              </p>
              <Link to="/analyze">
                <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-200">
                  Check Your Score
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Rewriting Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Don't just find the problem. Fix it.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              AI-powered suggestions preserve your actual experience while making your impact clearer.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-zinc-800 bg-[#0f0f12]">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Before</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                "Built an API for a job platform."
              </p>
            </div>

            <div className="p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-indigo-400" />
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Improved</span>
              </div>
              <p className="text-sm text-white leading-relaxed">
                "Built a FastAPI backend serving 10K+ requests/day with Redis caching, reducing API latency by 35%."
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/analyze">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-200">
                Improve My Resume
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                See what the job actually requires.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Compare your resume against the role's requirements in seconds. Identify exactly which skills to highlight and which gaps to address.
              </p>
            </div>

            <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-6">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-2 uppercase tracking-wider">Matched</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-amber-400 mb-2 uppercase tracking-wider">Partial</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["AWS"].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wider">Missing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Kubernetes", "Terraform"].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Preparation Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-6">
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                  {["Technical", "Behavioral", "Project Deep Dive", "Role Specific"].map((cat, i) => (
                    <span key={cat} className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${i === 0 ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"}`}>
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-sm font-medium mb-2">How did you design the Redis caching layer in your backend system?</p>
                    <div className="space-y-2 text-xs text-zinc-500">
                      <div>
                        <span className="text-zinc-400 font-medium">Why they're asking: </span>
                        <span>Evaluate architecture decisions and system design thinking.</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 font-medium">Strong answer covers: </span>
                        <span>Cache invalidation, TTL strategy, failure handling, and measurable impact.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
                    <p className="text-sm font-medium">Describe a time you had to debug a critical production issue.</p>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
                    <p className="text-sm font-medium">How would you scale this system to handle 100x more traffic?</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                Prepare for the interview your resume gets you.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Interview questions generated from your actual resume and target role. Practice with questions that mirror what you'll actually be asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Readiness Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Know where you stand before you apply.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              A professional hiring-readiness report with strengths, weaknesses, and recommended roles.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-[#0f0f12] border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold tracking-tight mb-1">82</div>
                <div className="text-sm text-zinc-500">Hiring Readiness</div>
                <div className="text-xs text-zinc-600">/100</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wider">Strengths</p>
                <ul className="space-y-2">
                  {["Strong backend experience", "Good API development exposure", "Strong database fundamentals"].map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-amber-400 mb-3 uppercase tracking-wider">Priority Improvements</p>
                <ul className="space-y-2">
                  {["Add cloud deployment evidence", "Quantify project impact", "Strengthen system design evidence"].map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <p className="text-xs font-medium text-indigo-400 mb-3 uppercase tracking-wider">Recommended Roles</p>
              <div className="flex flex-wrap gap-2">
                {["Backend Engineer", "Software Engineer", "AI/ML Engineer"].map((role) => (
                  <span key={role} className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Your next application can be better.
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Upload your resume. Add the role you're targeting. Let AI show you exactly what to improve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/analyze">
              <Button size="xl" className="bg-white text-zinc-900 hover:bg-zinc-200">
                Analyze My Resume
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            Start with your current resume — no redesign required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 font-bold text-base mb-3">
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-zinc-900" />
                </div>
                <span>AI Resume Enhancer</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                AI-powered career intelligence for better applications.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-3">Product</p>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">How It Works</a></li>
                <li><Link to="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-3">Resources</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">GitHub</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300 mb-3">Legal</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} AI Resume Enhancer. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600">
              Powered by LangGraph + Groq
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
