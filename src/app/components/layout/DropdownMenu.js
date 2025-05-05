"use client";
import { useState, useRef, useEffect } from "react";
import LoadingLink from "@/app/components/ui/LoadingLink";

export default function DropdownMenu({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard accessibility: close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
    } else {
      document.removeEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-400 hover:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-[#93233B]"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-sm font-medium">
          {user.name || user.firstName || user.username}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-[#232323] rounded-lg shadow-xl border border-gray-700 z-50 py-2 max-h-60 overflow-y-auto flex flex-col"
          role="menu"
        >
          {user.role === "judge" && (
            <>
              <LoadingLink
                href="/vote"
                className="block px-4 py-3 text-gray-200 hover:bg-[#93233B] hover:text-white transition-colors text-left w-full"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Vote
              </LoadingLink>
              <LoadingLink
                href="/judge-votes"
                className="block px-4 py-3 text-gray-200 hover:bg-[#93233B] hover:text-white transition-colors text-left w-full"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                My Votes
              </LoadingLink>
            </>
          )}
          {user.role === "admin" && (
            <LoadingLink
              href="/admin"
              className="block px-4 py-3 text-gray-200 hover:bg-[#93233B] hover:text-white transition-colors text-left w-full"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Admin Dashboard
            </LoadingLink>
          )}
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="block w-full text-left px-4 py-3 text-gray-200 hover:bg-[#93233B] hover:text-white transition-colors rounded-b-lg"
            role="menuitem"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
