import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="relative flex flex-col items-center min-h-screen overflow-x-hidden bg-slate-50">
      {/* Background Gradients - Consistent with Home */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-sky-400/20 via-blue-500/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-indigo-500/15 via-purple-400/10 to-transparent blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-3xl px-6 py-20 md:py-32">
        {/* Back Link */}
        <Link 
          href="/map"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm transition-all mb-12 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Map
        </Link>

        {/* Content Card */}
        <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[40px] p-8 md:p-16 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)]">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              About the <span className="text-blue-600">Navigator</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Campus Navigator is an advanced spatial discovery system designed to help students, 
              faculty, and visitors explore the Ateneo de Davao University campus with ease and precision.
            </p>
          </header>

          <div className="space-y-12">
            <section>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Mission</h2>
              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8">
                <p className="text-slate-700 leading-relaxed font-semibold italic">
                  "To bridge the gap between students and campus resources through a modern, 
                  intuitive, and interactive digital interface."
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">The Development Team</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Creators</span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">RIZAL GROUP 1</span>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    This project was engineered as a collaborative effort to improve campus life through technology.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Technology Stack</h2>
              <div className="flex flex-wrap gap-2">
                {["Next.js 15", "Mapbox GL JS", "Tailwind CSS", "TypeScript", "React Map GL"].map(tech => (
                  <span key={tech} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
            Ateneo de Davao University • 2024
          </p>
        </footer>
      </main>

      {/* Background Grain */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay z-0" />
    </div>
  );
}
