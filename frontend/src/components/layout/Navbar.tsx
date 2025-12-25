// frontend/src/components/layout/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

const Navbar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-green-700">
          North Wollo Tourism
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <Link href="/tourisms" className="hover:text-green-700">Tourism</Link>
          <Link href="/hotels" className="hover:text-green-700">Hotels</Link>
          <Link href="/map" className="hover:text-green-700">Map</Link>
          <Link href="/about" className="hover:text-green-700">About</Link>
          <Link href="/contact" className="hover:text-green-700">Contact</Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-between h-6 w-6 focus:outline-none"
          onClick={() => setIsMobileOpen(true)}
        >
          <span className="block h-0.5 w-full bg-gray-700 rounded" />
          <span className="block h-0.5 w-full bg-gray-700 rounded" />
          <span className="block h-0.5 w-full bg-gray-700 rounded" />
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </header>
  );
};

export default Navbar;
