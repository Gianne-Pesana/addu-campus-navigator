import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 px-6 text-center">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
          Campus Navigator
        </h1>
        <p className="text-lg text-zinc-600 max-w-md mx-auto">
          Discover study spots, restrooms, food, and more around campus with our interactive map.
        </p>
      </header>

      <main>
        <Link 
          href="/map"
          className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Open Map
        </Link>
      </main>

      <footer className="mt-24 text-sm text-zinc-400">
        Built for students by Campus Navigator Team
      </footer>
    </div>
  );
}
