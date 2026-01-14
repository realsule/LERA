import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('🚀 App component mounted');
    console.log('📱 Window location:', window.location.href);
    console.log('🎨 CSS classes should work if Tailwind is loaded');
    
    // Test if Tailwind classes are applied
    const testElement = document.querySelector('.text-4xl');
    if (testElement) {
      console.log('✅ Tailwind classes found in DOM');
    } else {
      console.log('❌ No Tailwind classes found');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 LERA Event Platform - Debug Mode
        </h1>
        <p className="text-gray-600 mb-8">
          If you can see this styled content, Tailwind CSS is working!
        </p>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong> Check browser console for detailed logs
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">🎵 Browse Events</h2>
            <p className="text-gray-600">Discover concerts, conferences, and more</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">🎤 Create Events</h2>
            <p className="text-gray-600">Organize and manage your own events</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-2">👥 Join Community</h2>
            <p className="text-gray-600">Connect with event enthusiasts</p>
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100">
            🚀 Explore Events
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
