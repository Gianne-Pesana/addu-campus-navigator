import Link from "next/link";
import { ThemeToggle } from "@/components/UI/ThemeToggle";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-landing-bg">
      {/* Theme Toggle Positioned Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Intense Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/10 dark:from-indigo-600/30 dark:to-purple-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-600/10 dark:from-blue-600/30 dark:to-cyan-600/20 blur-[120px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[150px]" />
      
      <main className="relative z-10 w-full max-w-3xl px-6 text-center">
        {/* Main Content Card - Glassmorphism */}
        <div className="bg-landing-card-bg backdrop-blur-2xl border border-landing-card-border rounded-[40px] p-6 md:p-12 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] transition-all duration-500">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
            </span>
            Campus Information Resource
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight py-2">
            <span className="block text-landing-text-primary transition-colors">Campus</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400">
              Navigator
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-landing-text-secondary max-w-lg mx-auto mb-10 leading-relaxed transition-colors">
            A comprehensive guide to university facilities. Locate study areas, restrooms, dining locations, and essential offices across the campus grounds.
          </p>

          <div className="flex flex-col items-center gap-8">
            {/* Primary Action */}
            <Link 
              href="/map"
              className="group relative inline-flex items-center justify-center h-16 px-10 text-lg font-bold text-white transition-all hover:scale-[1.05] active:scale-[0.95]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl blur-md group-hover:blur-xl opacity-70 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl" />
              
              <span className="relative z-10 flex items-center gap-2.5">
                Open Campus Map
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>

            {/* Branding Section */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-5" />
              <span className="text-zinc-400 dark:text-zinc-500 text-[9px] uppercase tracking-[0.4em] font-bold mb-1.5">
                Project By
              </span>
              <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
                RIZAL GROUP 1
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 pointer-events-none brightness-100 contrast-150" />
      
      {/* Subtle Floating Shapes */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-indigo-500/20 rounded-full blur-sm animate-bounce delay-300" />
      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-purple-500/20 rounded-full blur-sm animate-bounce delay-700" />
    </div>
  );
}
