import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
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
  );
}
