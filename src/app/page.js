"use client";

import Link from 'next/link';
import React from 'react';
import HomeSignInOrDashboardButton from './components/HomeSignInOrDashboardButton';
import CategoriesSection from './components/CategoriesSection';
export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#93233B]">
            El Warsha Art Fair
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Welcome to the Digital Art Exhibition & Competition
          </p>
          {/* Role-based Sign In / Dashboard / Voting button */}
          <HomeSignInOrDashboardButton />
        </div>

        {/* Categories Section */}
        {/* Memoized categories section for performance */}
        <CategoriesSection />

        {/* Event Details */}
        <div className="bg-[#1e1e1e] rounded-lg shadow-md p-8 mt-16">
          <h2 className="text-2xl font-bold mb-4 text-white">Event Details</h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              Join us in celebrating the diverse artistic talents across multiple disciplines.
              Our expert judges will evaluate each piece based on creativity, technique, and overall impact.
            </p>
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-white">Judging Criteria:</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Technique Execution</li>
                <li>Creativity & Originality</li>
                <li>Concept & Message</li>
                <li>Aesthetic Impact</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
