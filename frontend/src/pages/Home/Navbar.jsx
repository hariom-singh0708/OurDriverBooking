import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        {/* Logo Section */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            {/* Simple Icon Mimicry */}
            <div className="h-6 w-8 bg-[#C05D38] rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px]">🚗</span>
            </div>
            <div className="text-stone-900 font-serif text-xl font-bold tracking-tight">
              VELOCITY <span className="font-light text-stone-500">DRIVES</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-stone-500">
            <a className="text-stone-900 border-b-2 border-[#C05D38] pb-1" href="#home">Home</a>
            <a className="hover:text-stone-900 transition-colors" href="#services">Services</a>
            <a className="hover:text-stone-900 transition-colors" href="#drivers">Drivers</a>
            <a className="hover:text-stone-900 transition-colors" href="#about">About</a>
            <a className="hover:text-stone-900 transition-colors" href="#contact">Contact</a>
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-4 items-center border-r border-stone-200 pr-6 mr-2">
             <button className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter hover:text-stone-900">EN</button>
             <button className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter hover:text-stone-900">HELP</button>
          </div>

          <Link
            to="/login"
            className="text-xs font-bold uppercase tracking-widest text-stone-900 hover:opacity-70"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-lg bg-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-stone-800 transition-all"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden rounded-lg p-2 text-stone-900"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-stone-900 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-stone-900 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-stone-900 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-4">
            <a className="block text-sm font-bold uppercase tracking-widest text-stone-900" href="#home">Home</a>
            <a className="block text-sm font-bold uppercase tracking-widest text-stone-500" href="#services">Services</a>
            <a className="block text-sm font-bold uppercase tracking-widest text-stone-500" href="#drivers">Drivers</a>
            <a className="block text-sm font-bold uppercase tracking-widest text-stone-500" href="#about">About</a>
            <div className="pt-4 border-t border-stone-100 flex flex-col gap-4">
              <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-stone-900">Login</Link>
              <Link to="/signup" className="w-full text-center rounded-lg bg-stone-900 py-3 text-xs font-bold uppercase tracking-widest text-white">Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}