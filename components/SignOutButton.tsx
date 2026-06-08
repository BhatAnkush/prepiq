"use client";

import { signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface Props {
  name?: string | null;
  image?: string | null;
}

export default function UserDropdown({ name, image }: Props) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setConfirming(false);
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 border border-white/8 rounded-lg hover:border-white/20 hover:bg-white/5 transition-colors"
      >
        {image ? (
          <Image
            src={image}
            alt={name ?? "User"}
            width={22}
            height={22}
            className="rounded-full"
          />
        ) : (
          <div className="w-5.5 h-5.5 rounded-full bg-violet-900 flex items-center justify-center text-[10px] font-medium text-violet-300">
            {name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-xs text-gray-400">{name?.split(" ")[0]}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#141414] border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          <div className="px-3 py-2.5 border-b border-white/6">
            <p className="text-xs font-medium text-white truncate">{name}</p>
          </div>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          ) : (
            <div className="px-3 py-3 space-y-2">
              <p className="text-xs text-gray-400 leading-relaxed">
                Are you sure you want to leave?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg py-1.5 transition-colors"
                >
                  Yes, sign out
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-1.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
