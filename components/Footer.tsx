import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { Github } from "@/components/Icons";
import { Logo } from "./Icons/Logo";

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/8 bg-black/30 backdrop-blur px-6 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Logo size={24} />
            <span className="font-semibold tracking-tight text-white">
              PrepIQ
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            AI interview practice grounded in real job descriptions, with
            focused feedback and model answers.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">
            Product
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/setup"
              className="text-gray-300 hover:text-white transition-colors w-fit"
            >
              Start Interview
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors w-fit"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/history"
              className="text-gray-300 hover:text-white transition-colors w-fit"
            >
              History
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">
            Open Source
          </h3>
          <a
            href="https://github.com/BhatAnkush/prepiq"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            View repository
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Built with <Heart className="w-3.5 h-3.5 inline text-red-500" /> by{" "}
            <a
              href="https://github.com/BhatAnkush"
              target="_blank"
              rel="noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              BhatAnkush
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="text-xs text-gray-600">
          {new Date().getFullYear()} PrepIQ. Free forever.
        </span>
        <span className="text-xs text-gray-600">
          Practice sharp. Interview confident.
        </span>
      </div>
    </footer>
  );
}
