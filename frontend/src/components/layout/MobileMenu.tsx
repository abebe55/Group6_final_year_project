// frontend/src/components/layout/MobileMenu.tsx
"use client";

import React from "react";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col">
      <div className="bg-white w-64 p-4 h-full shadow-lg">
        <button
          onClick={onClose}
          className="text-gray-700 font-bold mb-6 focus:outline-none"
        >
          Close &times;
        </button>
        <nav className="flex flex-col space-y-3">
          <Link href="/" onClick={onClose} className="hover:text-green-700">Home</Link>
          <Link href="/tourisms" onClick={onClose} className="hover:text-green-700">Tourism Places</Link>
          <Link href="/hotels" onClick={onClose} className="hover:text-green-700">Hotels</Link>
          <Link href="/map" onClick={onClose} className="hover:text-green-700">Map</Link>
          <Link href="/about" onClick={onClose} className="hover:text-green-700">About</Link>
          <Link href="/contact" onClick={onClose} className="hover:text-green-700">Contact</Link>
        </nav>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

export default MobileMenu;
