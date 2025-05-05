"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { memo } from "react";
const HomeSignInOrDashboardButton = memo(function HomeSignInOrDashboardButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-gray-300 bg-[#2a2a2a] animate-pulse shadow-md">
        Loading...
      </div>
    );
  }

  if (session?.user?.role === "admin") {
    return (
      <Link
        href="/admin"
        prefetch={true}
        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#93233B] hover:bg-[#7a1d31] transition-colors md:py-4 md:text-lg md:px-10 shadow-md w-full sm:w-auto min-h-[44px]"
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
        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#93233B] hover:bg-[#7a1d31] transition-colors md:py-4 md:text-lg md:px-10 shadow-md w-full sm:w-auto min-h-[44px]"
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
      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#93233B] hover:bg-[#7a1d31] transition-colors md:py-4 md:text-lg md:px-10 shadow-md w-full sm:w-auto min-h-[44px]"
    >
      Sign In
    </Link>
  );
});

export default HomeSignInOrDashboardButton;