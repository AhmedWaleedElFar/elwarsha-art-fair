'use client';
import LoadingLink from '@/app/components/ui/LoadingLink';
import { useSession, signOut } from 'next-auth/react';
import DropdownMenu from './DropdownMenu';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="bg-[#1e1e1e] shadow-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
          
            <LoadingLink href="/login" className="text-2xl font-bold text-[#93233B] hover:text-[#7a1d31] transition-colors">
            <img src="/logo.png" alt="Elwarsha Art Fair Logo" style={{ height: 40, paddingRight: 16 }} />
            </LoadingLink>
          </div>
          <div className="flex gap-4 items-center">
            {/* Only show Login if not logged in */}
            {!user && status !== 'loading' && (
              <LoadingLink 
                href="/login" 
                className="text-gray-300 hover:text-[#93233B] transition-colors font-medium px-3 py-2 rounded-md hover:bg-[#2a2a2a]"
              >
                Login
              </LoadingLink>
            )}
            {/* Only show DropdownMenu if logged in */}
            {user && (
              <DropdownMenu 
                user={user} 
                signOut={() => signOut({ callbackUrl: '/login' })} 
              />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
