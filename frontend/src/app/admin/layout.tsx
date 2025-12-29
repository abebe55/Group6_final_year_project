"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { username, role, logout, isAuthenticated, token } = useAuthStore();

  // Wait for client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated after client-side hydration
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isClient, isAuthenticated, router, pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '📊',
      current: pathname === '/admin'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: '👥',
      current: pathname.startsWith('/admin/users')
    },
    {
      name: 'Hotels',
      href: '/admin/hotels',
      icon: '🏨',
      current: pathname.startsWith('/admin/hotels')
    },
    {
      name: 'Tourism Places',
      href: '/admin/tourisms',
      icon: '🏞️',
      current: pathname.startsWith('/admin/tourisms')
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: '📅',
      current: pathname.startsWith('/admin/bookings')
    },
    {
      name: 'Guiders',
      href: '/admin/guiders',
      icon: '🗺️',
      current: pathname.startsWith('/admin/guiders')
    },
    {
      name: 'Map Points',
      href: '/admin/mappoints',
      icon: '📍',
      current: pathname.startsWith('/admin/mappoints')
    },
    {
      name: 'Roads',
      href: '/admin/roads',
      icon: '🛣️',
      current: pathname.startsWith('/admin/roads')
    },
    {
      name: 'Horse Services',
      href: '/admin/horseservices',
      icon: '🐎',
      current: pathname.startsWith('/admin/horseservices')
    }
  ];

  const auditNavigation = [
    {
      name: 'Audit Dashboard',
      href: '/admin/audit/dashboard',
      icon: '📈',
      current: pathname === '/admin/audit/dashboard'
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit',
      icon: '📋',
      current: pathname === '/admin/audit'
    },
    {
      name: 'Security Events',
      href: '/admin/audit/security',
      icon: '🚨',
      current: pathname === '/admin/audit/security'
    },
    {
      name: 'Management',
      href: '/admin/audit/management',
      icon: '⚙️',
      current: pathname === '/admin/audit/management'
    }
  ];

  const NavLink = ({ item }: { item: any }) => (
    <Link
      href={item.href}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
        item.current
          ? 'bg-emerald-600 text-white'
          : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      <span className="mr-3 text-lg">{item.icon}</span>
      {item.name}
    </Link>
  );

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need administrator privileges to access this area.</p>
          <Link href="/auth/login" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 mr-2">
            Login
          </Link>
          <Link href="/" className="inline-block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-gray-200">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <span className="text-gray-600 text-xl">×</span>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
              <div className="pt-4">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Audit & Security
                </h3>
                <div className="mt-2 space-y-1">
                  {auditNavigation.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </div>
              </div>
              {/* Mobile Logout Button */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-2 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  <span className="mr-3 text-lg">🚪</span>
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
              <div className="pt-6">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Audit & Security
                </h3>
                <div className="mt-2 space-y-1">
                  {auditNavigation.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{username}</p>
                  <p className="text-xs font-medium text-gray-500">{role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <span className="text-xl">☰</span>
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;