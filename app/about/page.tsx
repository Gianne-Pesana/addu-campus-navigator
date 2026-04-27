import Link from "next/link";
import { ThemeToggle } from "@/components/UI/ThemeToggle";

export default function AboutPage() {
  return (
    <div className="relative flex flex-col items-center min-h-screen overflow-x-hidden bg-background transition-colors duration-500">
      {/* Theme Toggle Positioned Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-400/10 via-blue-500/5 to-transparent dark:from-indigo-600/20 dark:via-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-indigo-500/10 via-purple-400/5 to-transparent dark:from-blue-600/20 dark:via-cyan-600/10 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-3xl px-6 py-20 md:py-32">
        {/* Back Link */}
        <Link 
          href="/map"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-panel-bg border border-panel-border text-foreground/60 hover:text-foreground shadow-sm transition-all mb-12 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Map
        </Link>

        {/* Content Card */}
        <div className="bg-panel-bg backdrop-blur-3xl border border-panel-border rounded-[40px] p-8 md:p-16 shadow-xl transition-all duration-500">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-6 transition-colors">
              About the <span className="text-indigo-600 dark:text-indigo-400 transition-colors">Navigator</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed font-medium transition-colors">
              Campus Navigator is an advanced spatial discovery system designed to help students, 
              faculty, and visitors explore the Ateneo de Davao University campus with ease and precision.
            </p>
          </header>

          <div className="space-y-12">
            <section>
              <h2 className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-6 transition-colors">Mission</h2>
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-8">
                <p className="text-foreground/80 leading-relaxed font-semibold italic transition-colors">
                  "To bridge the gap between students and campus resources through a modern, 
                  intuitive, and interactive digital interface."
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-6 transition-colors">The Development Team</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col p-6 rounded-2xl bg-foreground/5 border border-panel-border">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 transition-colors">Creators</span>
                  <span className="text-xl font-black text-foreground tracking-tight transition-colors">RIZAL GROUP 1</span>
                  <p className="text-sm text-foreground/50 mt-2 font-medium transition-colors">
                    This project was engineered as a collaborative effort to improve campus life through technology.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-6 transition-colors">Technology Stack</h2>
              <div className="flex flex-wrap gap-2">
                {["Next.js 15", "Mapbox GL JS", "Tailwind CSS", "TypeScript", "React Map GL"].map(tech => (
                  <span key={tech} className="px-4 py-2 bg-background border border-panel-border rounded-xl text-xs font-bold text-foreground/60 shadow-sm transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-xs font-black text-foreground/40 uppercase tracking-[0.4em] transition-colors">
            Ateneo de Davao University • 2024
          </p>
        </footer>
      </main>

      {/* Background Grain */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay z-0" />
    </div>
  );
}
