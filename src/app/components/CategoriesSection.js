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
          <div key={idx} className="bg-[#1e1e1e] rounded-lg shadow-md 0 p-6 flex flex-col items-center animate-pulse">
            <div className="w-20 h-6 bg-[#2a2a2a] rounded mb-2" />
            <div className="w-32 h-4 bg-[#333333] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {categories.map((cat) => (
        <div key={cat.title} className="bg-[#1e1e1e] rounded-lg shadow-md  p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-2xl font-bold mb-2 text-[#93233B]">
            {cat.title}
          </span>
          <span className="text-gray-300 text-sm text-center">
            {cat.description}
          </span>
        </div>
      ))}
    </div>
  );
}
