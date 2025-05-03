'use client';
import LoadingLink from '@/app/components/ui/LoadingLink';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="bg-[#1e1e1e] shadow-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Elwarsha Art Fair Logo" style={{ height: 40, paddingRight: 16 }} />
            <LoadingLink href="/" className="text-2xl font-bold text-[#93233B] hover:text-[#7a1d31] transition-colors">
              
            </LoadingLink>
          </div>
          <div className="flex gap-4 items-center">
            {/* Show Vote for judges only */}
            {user?.role === 'judge' && (
  <>
    <LoadingLink 
      href="/vote" 
      className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
    >
      Vote
    </LoadingLink>
    <LoadingLink 
      href="/judge-votes" 
      className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
    >
      My Votes
    </LoadingLink>
  </>
)}
            {/* Show Admin for admins only */}
            {user?.role === 'admin' && (
              <LoadingLink 
                href="/admin" 
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
              >
                Admin Dashboard
              </LoadingLink>
            )}
            {/* Show Login if not logged in */}
            {!user && status !== 'loading' && (
              <LoadingLink 
                href="/login" 
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
              >
                Login
              </LoadingLink>
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
