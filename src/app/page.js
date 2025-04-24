import Link from 'next/link';

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
          <Link 
            href="/vote"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
          >
            Start Voting
          </Link>
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { title: 'Photography', description: 'Capturing moments in time' },
            { title: 'Paintings', description: 'Traditional artistic expression' },
            { title: 'Digital Painting', description: 'Modern digital masterpieces' },
            { title: 'Drawing', description: 'Sketches and illustrations' },
          ].map((category) => (
            <div key={category.title} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
            </div>
          ))}
        </div>

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
                <li>Creativity and Innovation</li>
                <li>Technical Excellence</li>
                <li>Artistic Vision</li>
                <li>Overall Impact</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
