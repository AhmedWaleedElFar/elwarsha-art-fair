'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingButton from '@/app/components/ui/LoadingButton';
import styles from '../components/login/login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.role === 'admin') {
      router.replace('/admin');
      return;
    } else if (session?.user?.role === 'judge' && Array.isArray(session.user.categories) && session.user.categories.length > 0) {
      router.replace('/vote');
      return;
    }
  }, [session, status, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else {
        // Fetch the session and redirect to the correct dashboard
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        if (session?.user?.role === 'admin') {
          await router.replace('/admin');
        } else if (session?.user?.role === 'judge' && Array.isArray(session.user.categories) && session.user.categories.length > 0) {
          await router.replace('/vote');
        } else {
          await router.replace('/'); // fallback
        }
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || (session && (session.user.role === 'admin' || (session.user.role === 'judge' && session.user.category)))) {
    // Show a loading spinner while determining where to redirect
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-lg text-gray-300">Redirecting...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-[#1e1e1e] p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Please sign in with your judge credentials
          </p>
        </div>
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="block w-full rounded-md border-0 py-2 px-3 bg-[#232323] text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#93233B] sm:text-sm sm:leading-6 min-h-[44px]"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-md border-0 py-2 px-3 bg-[#232323] text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#93233B] sm:text-sm sm:leading-6 min-h-[44px]"
            />
          </div>
          <LoadingButton
            type="submit"
            isLoading={loading}
            className="w-full rounded-md bg-[#93233B] px-3 py-3 text-sm font-semibold text-white hover:bg-[#7a1d31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93233B] disabled:bg-[#93233B]/50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            Sign in
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
