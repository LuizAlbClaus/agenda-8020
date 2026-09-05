"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, ArrowRight, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LandingHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setIsLoggedIn(true);
        }
      });
    } catch {
      // Caso o Supabase não esteja configurado no ambiente local/build
    }
  }, []);

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-2 sm:pt-8 sm:pb-4 w-full">
      <Link
        href="/"
        className="inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C2A26] rounded-md"
        aria-label="Agenda 80/20 Início"
      >
        <Image
          src="/media/agenda8020/brand-logo.png"
          alt="agenda 80/20"
          width={180}
          height={36}
          className="h-7 sm:h-8 w-auto object-contain"
          priority
        />
      </Link>

      <div className="flex items-center">
        {isLoggedIn ? (
          <Link
            href="/today"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-[#0C2A26] bg-[#0E3D36]/8 hover:bg-[#0E3D36]/15 border border-[#0E3D36]/20 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C2A26]"
          >
            <User className="size-3.5 sm:size-4 text-[#0E3D36]" />
            <span>Meu Painel</span>
            <ArrowRight className="size-3 text-[#0E3D36]" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-[#0C2A26] hover:text-[#0C2A26] bg-white/85 hover:bg-white border border-[#0E3D36]/15 shadow-xs hover:shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C2A26]"
          >
            <LogIn className="size-3.5 sm:size-4 text-[#0E3D36]" />
            <span>Entrar</span>
          </Link>
        )}
      </div>
    </header>
  );
}

