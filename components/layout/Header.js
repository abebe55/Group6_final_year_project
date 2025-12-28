import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-2xl font-bold">North Wollo Tourism</h1>
              <p className="text-sm text-blue-200">Discover Ethiopia's Hidden Gems</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link href="/places" className="hover:text-blue-200 transition">
              Places
            </Link>
            <Link href="/hotels" className="hover:text-blue-200 transition">
              Hotels
            </Link>
            <Link href="/search" className="hover:text-blue-200 transition">
              Search
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
