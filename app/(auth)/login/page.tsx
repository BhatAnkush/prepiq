"use client";
import { signIn } from "next-auth/react";
import { Zap } from "lucide-react";
import { Google } from "@/components/Icons";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-[-20%] left-[50%] translate-x-[-50%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 bg-violet-500 rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight text-lg">PrepIQ</span>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to start your personalised mock interview.
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            <Google size={18} className="w-4 h-4" />
            Continue with Google
          </button>
          <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
            Free forever. No credit card. Your data stays yours.
          </p>
        </div>
      </div>
    </main>
  );
}
