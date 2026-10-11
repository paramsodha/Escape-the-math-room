import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import menuBg from "@/assets/menu-bg.jpg";

export function ScreenShell({ title, children, back = true }: { title?: string; children: ReactNode; back?: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <img src={menuBg} alt="" aria-hidden width={1920} height={1088} className="anim-zoom absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="scrim absolute inset-0" />
      <div className="vignette absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {(back || title) && (
          <header className="mb-8 flex items-center gap-4">
            {back && (
              <Link to="/" className="btn btn-stone btn-icon" aria-label="Back to main menu">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            {title && <h1 className="text-gradient-amber text-3xl font-black sm:text-4xl">{title}</h1>}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}
