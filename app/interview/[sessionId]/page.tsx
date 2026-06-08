"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  BarChart3,
  ArrowRight,
  Star,
} from "lucide-react";
import { Logo } from "@/components/Icons/Logo";

interface Question {
  id: string;
  questionText: string;
  category: string;
  difficulty: string;
  targetSkill: string;
  userAnswer?: string;
  score?: number;
  feedback?: string;
  modelAnswer?: string;
}

interface Session {
  _id: string;
  companyName: string;
  roleTitle: string;
  questions: Question[];
  analysis: { techStack: string[]; seniorityLevel: string };
}

export default function InterviewPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewerResponse, setInterviewerResponse] = useState("");
  const [scoreData, setScoreData] = useState<Record<string, any>>({});
  const [phase, setPhase] = useState<
    "answering" | "streaming" | "scored" | "done"
  >("answering");
  const [timeLeft, setTimeLeft] = useState(120);
  const [conversationHistory, setConversationHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/session?id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setConversationHistory([
          { role: "assistant", content: data.questions[0]?.questionText },
        ]);
      });
  }, [sessionId]);

  useEffect(() => {
    if (phase !== "answering") return;
    setTimeLeft(120);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIdx, phase]);

  async function handleSubmit() {
    if (!userAnswer.trim() || !session) return;
    clearInterval(timerRef.current);
    setPhase("streaming");
    const currentQuestion = session.questions[currentIdx];
    const newHistory = [
      ...conversationHistory,
      { role: "user", content: userAnswer },
    ];
    setConversationHistory(newHistory);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        questionId: currentQuestion.id,
        userAnswer,
        conversationHistory: newHistory,
      }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    setInterviewerResponse("");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullResponse += chunk;
      setInterviewerResponse((prev) => prev + chunk);
    }

    const scoreRes = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        questionId: currentQuestion.id,
        userAnswer,
        questionText: currentQuestion.questionText,
        roleTitle: session.roleTitle,
        techStack: session.analysis.techStack,
      }),
    });
    const scored = await scoreRes.json();
    setScoreData((prev) => ({ ...prev, [currentQuestion.id]: scored }));
    setPhase("scored");
  }

  function handleNext() {
    if (!session) return;
    if (currentIdx + 1 >= session.questions.length) {
      setPhase("done");
      return;
    }
    const nextIdx = currentIdx + 1;
    setCurrentIdx(nextIdx);
    setUserAnswer("");
    setInterviewerResponse("");
    setConversationHistory([
      { role: "assistant", content: session.questions[nextIdx].questionText },
    ]);
    setPhase("answering");
    textareaRef.current?.focus();
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your interview...</p>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    const scores = Object.values(scoreData).map((s: any) => s.score);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Interview complete
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            {session.companyName} · {session.roleTitle}
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl mb-8">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <span className="text-4xl font-black text-violet-400">{avg}</span>
            <span className="text-gray-400 text-sm">/10 avg score</span>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
            >
              View full report <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/setup")}
              className="px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              New interview
            </button>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = session.questions[currentIdx];
  const currentScore = scoreData[currentQuestion.id];
  const timerPct = (timeLeft / 120) * 100;
  const timerColor =
    timeLeft > 60 ? "#8b5cf6" : timeLeft > 30 ? "#f59e0b" : "#ef4444";

  const difficultyConfig: Record<string, { color: string; icon: JSX.Element }> =
    {
      hard: {
        color: "text-red-400 bg-red-500/10 border-red-500/20",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      medium: {
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        icon: <ChevronRight className="w-3 h-3" />,
      },
      easy: {
        color: "text-green-400 bg-green-500/10 border-green-500/20",
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
    };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Logo className="w-3.5 h-3.5 text-white" />
          <span className="text-sm text-gray-400">
            {session.companyName} · {session.roleTitle}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {currentIdx + 1} / {session.questions.length}
          </span>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: timerColor }} />
            <span className="text-xs font-mono" style={{ color: timerColor }}>
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded text-xs text-gray-400 capitalize">
            {currentQuestion.category.replace("-", " ")}
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${difficultyConfig[currentQuestion.difficulty]?.color}`}
          >
            {difficultyConfig[currentQuestion.difficulty]?.icon}
            {currentQuestion.difficulty}
          </span>
          <span className="text-xs text-gray-600">
            ↳ {currentQuestion.targetSkill}
          </span>
        </div>

        {/* Question */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <p className="text-base leading-relaxed font-medium">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Answer */}
        {(phase === "answering" || phase === "streaming") && (
          <>
            <textarea
              ref={textareaRef}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here... Use the STAR method for behavioral questions: Situation, Task, Action, Result."
              rows={7}
              disabled={phase === "streaming"}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50 mb-4"
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim() || phase === "streaming"}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {phase === "streaming" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  Submit answer <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {/* Streaming interviewer response */}
        {phase === "streaming" && interviewerResponse && (
          <div className="mt-6 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              Interviewer
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {interviewerResponse}
            </p>
          </div>
        )}

        {/* Scored state */}
        {phase === "scored" && currentScore && (
          <div className="space-y-4">
            {interviewerResponse && (
              <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  Interviewer follow-up
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {interviewerResponse}
                </p>
              </div>
            )}

            <div className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              {/* Score header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold">Your score</span>
                </div>
                <span
                  className={`text-2xl font-black ${currentScore.score >= 8 ? "text-green-400" : currentScore.score >= 5 ? "text-amber-400" : "text-red-400"}`}
                >
                  {currentScore.score}/10
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                {currentScore.feedback}
              </p>

              {currentScore.strengths?.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <p className="text-xs font-semibold text-green-400">
                      What worked
                    </p>
                  </div>
                  {currentScore.strengths.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-gray-400 mb-1 pl-5">
                      {s}
                    </p>
                  ))}
                </div>
              )}

              {currentScore.improvements?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-xs font-semibold text-amber-400">
                      Improve on
                    </p>
                  </div>
                  {currentScore.improvements.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-gray-400 mb-1 pl-5">
                      {s}
                    </p>
                  ))}
                </div>
              )}

              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3.5 h-3.5 text-violet-400" />
                  <p className="text-xs font-semibold text-violet-400">
                    Model answer (9/10)
                  </p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {currentScore.modelAnswer}
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {currentIdx + 1 >= session.questions.length ? (
                <>
                  See results <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next question ({currentIdx + 2}/{session.questions.length}){" "}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
