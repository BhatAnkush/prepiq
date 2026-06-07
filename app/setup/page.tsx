"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Upload, FileText, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [jdText, setJdText] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [step, setStep] = useState<"input" | "analysing" | "generating">("input")
  const [error, setError] = useState("")

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeFile(file)
    const formData = new FormData()
    formData.append("resume", file)
    const res = await fetch("/api/resume", { method: "POST", body: formData })
    const data = await res.json()
    setResumeText(data.text)
  }

  async function handleStart() {
    if (!jdText.trim()) return setError("Please paste a job description.")
    if (!resumeText) return setError("Please upload your resume.")
    setError("")
    setStep("analysing")
    try {
      const analyseRes = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, resumeText }),
      })
      const analysis = await analyseRes.json()
      setStep("generating")
      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, resumeText, analysis }),
      })
      const { sessionId } = await sessionRes.json()
      router.push(`/interview/${sessionId}`)
    } catch {
      setError("Something went wrong. Please try again.")
      setStep("input")
    }
  }

  const isLoading = step !== "input"

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-0 left-[50%] translate-x-[-50%] w-[500px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-violet-500 rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight">PrepIQ</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-2">Set up your interview</h1>
        <p className="text-gray-500 text-sm mb-10">
          Paste the job description and upload your resume. We'll generate 8 questions tailored to that exact role.
        </p>

        {/* JD Input */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Job Description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here — the more detail, the better the questions..."
            rows={10}
            disabled={isLoading}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
          />
          <p className="text-xs text-gray-600 mt-1">{jdText.length} characters</p>
        </div>

        {/* Resume Upload */}
        <div className="mb-8">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            <Upload className="w-3.5 h-3.5" /> Your Resume (PDF)
          </label>
          <label className={`flex items-center gap-4 p-4 bg-white/[0.03] border border-dashed rounded-xl cursor-pointer transition-colors ${resumeFile ? "border-violet-500/40" : "border-white/[0.08] hover:border-white/20"} ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="w-10 h-10 bg-white/[0.05] rounded-lg flex items-center justify-center flex-shrink-0">
              {resumeFile
                ? <CheckCircle2 className="w-5 h-5 text-violet-400" />
                : <Upload className="w-5 h-5 text-gray-500" />
              }
            </div>
            <div>
              <p className="text-sm font-medium">{resumeFile ? resumeFile.name : "Click to upload resume"}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {resumeText ? `${resumeText.length} characters extracted` : "PDF up to 10MB"}
              </p>
            </div>
            <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={isLoading} />
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mb-6 px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-violet-400 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            {step === "analysing" ? "Analysing job description and resume..." : "Generating your personalised questions..."}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={isLoading || !jdText || !resumeText}
          className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing your interview...</>
            : <>Start mock interview <ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </main>
  )
}