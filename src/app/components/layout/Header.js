'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="bg-[#1e1e1e] shadow-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#93233B] hover:text-[#7a1d31] transition-colors">
            El Warsha Art Fair
          </Link>
          <div className="flex gap-4 items-center">
            {/* Show Vote for judges only */}
            {user?.role === 'judge' && (
  <>
    <Link 
      href="/vote" 
      className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
    >
      Vote
    </Link>
    <Link 
      href="/judge-votes" 
      className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
    >
      My Votes
    </Link>
  </>
)}
            {/* Show Admin for admins only */}
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
              >
                Admin Dashboard
              </Link>
            )}
            {/* Show Login if not logged in */}
            {!user && status !== 'loading' && (
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
              >
                Login
              </Link>
            )}
            {/* Show Sign Out if logged in */}
            {user && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
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
