import Link from "next/link";
import { Zap, Target, BarChart3, ArrowRight } from "lucide-react";
import { Github } from "@/components/Icons";

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] pointer-events-none" />
      <div className="fixed top-[-20%] left-[50%] translate-x-[-50%] w-150 h-150 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Free · Open source · No credit card
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
          Mock interviews
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">
            built for your JD
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Paste any job description. Upload your resume. Get a tailored mock
          interview that asks about the company's actual stack — then scores
          your answers with model answers to compare.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            Start your mock interview <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/BhatAnkush/prepiq"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" /> View on GitHub
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5 text-violet-400" />,
              title: "JD-grounded questions",
              desc: "We read the actual tech stack in the JD and ask about it. If they use Kafka, you'll get asked about Kafka.",
            },
            {
              icon: <Target className="w-5 h-5 text-violet-400" />,
              title: "Gap + strength targeting",
              desc: "Cross-references your resume with the JD. 3 questions on your gaps, 3 on your strengths, 2 behavioral.",
            },
            {
              icon: <BarChart3 className="w-5 h-5 text-violet-400" />,
              title: "Score + model answers",
              desc: "Every answer is scored 1–10 with a rubric and a model answer showing what a 9/10 looks like.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 bg-white/3 border border-white/6 rounded-xl hover:border-white/10 transition-colors"
            >
              <div className="w-9 h-9 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
