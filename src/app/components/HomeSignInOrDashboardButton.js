"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { memo } from "react";
const HomeSignInOrDashboardButton = memo(function HomeSignInOrDashboardButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 animate-pulse">
        Loading...
      </div>
    );
  }

  if (session?.user?.role === "admin") {
    return (
      <Link
        href="/admin"
        prefetch={true}
        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
      >
        Go to Dashboard
      </Link>
    );
  }
  if (session?.user?.role === "judge" && Array.isArray(session.user.categories) && session.user.categories.length > 0) {
    return (
      <Link
        href="/vote"
        prefetch={true}
        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
      >
        Go to Voting Page
      </Link>
    );
  }
  // Not signed in
  return (
    <Link
      href="/login"
      prefetch={true}
      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
    >
      Sign In
    </Link>
  );
});

export default HomeSignInOrDashboardButton;