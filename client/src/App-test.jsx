import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, React and Tailwind are working!</p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Component Test</h2>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
