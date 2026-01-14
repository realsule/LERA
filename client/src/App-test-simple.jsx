import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          LERA Event Platform
        </h1>
        <p className="text-gray-600 mb-8">
          Your premier platform for discovering and booking amazing events
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">Browse Events</h2>
            <p className="text-gray-600">Discover concerts, conferences, and more</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">Create Events</h2>
            <p className="text-gray-600">Organize and manage your own events</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">Join Community</h2>
            <p className="text-gray-600">Connect with event enthusiasts</p>
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100">
            Explore Events
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
