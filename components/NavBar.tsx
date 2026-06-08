import Link from "next/link";
import { auth } from "@/lib/auth";
import { Plus } from "lucide-react";
import { Logo } from "./Icons/Logo";
import UserDropdown from "./SignOutButton";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="relative z-20 w-full border-b border-white/6 px-6 py-0 flex items-center justify-between h-15">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={28} />
        <span className="font-medium text-white tracking-tight">PrepIQ</span>
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            Dashboard
          </Link>
          
          <div className="w-px h-4 bg-white/8 mx-1" />
          <UserDropdown name={session.user.name} image={session.user.image} />
          <Link
            href="/setup"
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New interview
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>
      )}
    </nav>
  );
}
