import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <div className="text-white font-bold tracking-wide">LOGO</div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
            <a className="hover:text-white" href="#ride">Ride</a>
            <a className="hover:text-white" href="#drive">Drive</a>
            <a className="hover:text-white" href="#business">Business</a>
            <a className="hover:text-white" href="#about">About</a>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-white/90 hover:text-white">En</button>
          <button className="text-sm text-white/90 hover:text-white">Help</button>
          <button className="text-sm text-white/90 hover:text-white">Login</button>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
            Sign up
          </button>
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-white/90 hover:bg-white/10"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-white"></span>
            <span className="block h-0.5 w-6 bg-white"></span>
            <span className="block h-0.5 w-6 bg-white"></span>
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-3 text-white/90 space-y-2">
            <a className="block hover:text-white" href="#ride">Ride</a>
            <a className="block hover:text-white" href="#drive">Drive</a>
            <a className="block hover:text-white" href="#business">Business</a>
            <a className="block hover:text-white" href="#about">About</a>

            <div className="pt-2 flex gap-3">
              <button className="text-sm hover:text-white">Help</button>
              <button className="text-sm hover:text-white">Login</button>
              <button className="ml-auto rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
