export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">North Wollo Tourism</h3>
            <p className="text-gray-400">
              Discover the rich heritage and natural beauty of North Wollo, Ethiopia.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/places" className="text-gray-400 hover:text-white">Places</a></li>
              <li><a href="/hotels" className="text-gray-400 hover:text-white">Hotels</a></li>
              <li><a href="/search" className="text-gray-400 hover:text-white">Search</a></li>
              <li><a href="/admin" className="text-gray-400 hover:text-white">Admin</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">
              Email: info@northwollotourism.et<br />
              Phone: +251 XX XXX XXXX
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 North Wollo Tourism Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
