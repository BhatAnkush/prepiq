import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import Link from "next/link";
import {
  Zap,
  Plus,
  TrendingUp,
  Building2,
  FileText,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import type { InterviewSession } from "@/types";
import { Logo } from "@/components/Icons/Logo";
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let sessions: InterviewSession[] = [];
  let isDbUnavailable = false;

  try {
    const client = await clientPromise;
    const db = client.db("interview-prep");

    sessions = await db
      .collection<InterviewSession>("sessions")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
  } catch (error) {
    isDbUnavailable = true;
    console.error("Failed to load dashboard sessions", error);
  }

  const sessionsWithScores = sessions.map((s) => {
    const scored = s.questions.filter((q) => q.score !== undefined); // no `any` needed now
    const avg = scored.length
      ? Math.round(
          scored.reduce((a, q) => a + (q.score as number), 0) / scored.length,
        )
      : null;
    return { ...s, avgScore: avg, scoredCount: scored.length };
  });

  const completedSessions = sessionsWithScores.filter(
    (s) => s.avgScore !== null,
  );
  const overallAvg = completedSessions.length
    ? Math.round(
        completedSessions.reduce((a, s) => a + (s.avgScore || 0), 0) /
          completedSessions.length,
      )
    : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <FileText className="w-3.5 h-3.5" /> Total interviews
            </div>
            <p className="text-3xl font-black">{sessions.length}</p>
          </div>
          <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Overall avg score
            </div>
            <p
              className={`text-3xl font-black ${overallAvg && overallAvg >= 7 ? "text-green-400" : overallAvg && overallAvg >= 5 ? "text-amber-400" : "text-gray-400"}`}
            >
              {overallAvg !== null ? `${overallAvg}/10` : "—"}
            </p>
          </div>
          <div className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Building2 className="w-3.5 h-3.5" /> Companies prepped
            </div>
            <p className="text-3xl font-black">
              {new Set(sessions.map((s) => s.companyName)).size}
            </p>
          </div>
        </div>

        {/* History */}
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Interview history
          </h2>
        </div>

        {isDbUnavailable && (
          <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Could not connect to MongoDB right now. Please retry in a few
            seconds.
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
            <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-gray-600 text-sm mb-4">No interviews yet.</p>
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start your first mock interview <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionsWithScores.map((s) => {
              const sessionId = s._id?.toString();
              if (!sessionId) return null;

              return (
                <Link
                  key={sessionId}
                  href={`/interview/${sessionId}`}
                  className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-white/10 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-500" />
                      <p className="font-semibold text-sm">{s.companyName}</p>
                      <span className="text-gray-600">·</span>
                      <p className="text-sm text-gray-400">{s.roleTitle}</p>
                    </div>
                    <p className="text-xs text-gray-600 pl-5">
                      {new Date(s.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {s.questions?.length || 0} questions · {s.scoredCount}{" "}
                      answered
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.avgScore !== null ? (
                      <span
                        className={`text-lg font-black ${s.avgScore >= 7 ? "text-green-400" : s.avgScore >= 5 ? "text-amber-400" : "text-red-400"}`}
                      >
                        {s.avgScore}/10
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600 px-2 py-1 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                        In progress
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
