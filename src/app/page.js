"use client";

import Link from 'next/link';
import React from 'react';
import HomeSignInOrDashboardButton from './components/HomeSignInOrDashboardButton';
import CategoriesSection from './components/CategoriesSection';
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            El Warsha Art Fair
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Welcome to the Digital Art Exhibition & Competition
          </p>
          {/* Role-based Sign In / Dashboard / Voting button */}
          <HomeSignInOrDashboardButton />
        </div>

        {/* Categories Section */}
        {/* Memoized categories section for performance */}
        <CategoriesSection />

        {/* Event Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Event Details</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Join us in celebrating the diverse artistic talents across multiple disciplines.
              Our expert judges will evaluate each piece based on creativity, technique, and overall impact.
            </p>
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold">Judging Criteria:</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
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
