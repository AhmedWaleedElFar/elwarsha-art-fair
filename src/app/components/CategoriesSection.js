import React, { useMemo, useState, useEffect } from "react";

const categoriesData = [
  { title: 'Photography', description: 'Capturing moments in time' },
  { title: 'Paintings', description: 'Traditional artistic expression' },
  { title: 'Digital Painting', description: 'Modern digital techniques' },
  { title: 'Drawing', description: 'Sketches and illustrations' },
];

export default function CategoriesSection() {
  const [loading, setLoading] = useState(true);
  const categories = useMemo(() => categoriesData, []);

  useEffect(() => {
    // Simulate loading
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    // Skeleton loader
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {categories.map((_, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col items-center animate-pulse">
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {categories.map((cat) => (
        <div key={cat.title} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col items-center">
          <span className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {cat.title}
          </span>
          <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
            {cat.description}
          </span>
        </div>
      ))}
    </div>
  );
}
