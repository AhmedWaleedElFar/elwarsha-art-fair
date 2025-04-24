'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            El Warsha
          </Link>
          <div className="flex gap-4 items-center">
            {/* Show Vote for judges only */}
            {user?.role === 'judge' && (
              <Link 
                href="/vote" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Vote
              </Link>
            )}
            {/* Show Admin for admins only */}
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Admin Dashboard
              </Link>
            )}
            {/* Show Login if not logged in */}
            {!user && status !== 'loading' && (
              <Link 
                href="/login" 
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Login
              </Link>
            )}
            {/* Show Sign Out if logged in */}
            {user && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-2"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
