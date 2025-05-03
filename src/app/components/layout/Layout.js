'use client';

import Header from './Header';
import { NavigationProvider } from '@/app/context/NavigationContext';
import PageLoadingIndicator from '@/app/components/ui/PageLoadingIndicator';
import TabLoadingIndicator from '@/app/components/ui/TabLoadingIndicator';

export default function Layout({ children }) {
  return (
    <NavigationProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <PageLoadingIndicator />
        <TabLoadingIndicator />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-[#1e1e1e] border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} El Warsha Art Fair. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-500">Celebrating art and creativity</p>
          </div>
        </footer>
      </div>
    </NavigationProvider>
  );
}
