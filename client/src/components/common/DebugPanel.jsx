import React, { useState, useEffect } from 'react';

/**
 * DebugPanel Component
 * 
 * Development-only debugging panel that shows component state,
 * props, and performance metrics. Only visible in development mode.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.componentData - Data to display for debugging
 * @returns {JSX.Element} Debug panel (only in development)
 */
const DebugPanel = ({ componentData = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  useEffect(() => {
    // Intercept console logs for display
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev.slice(-50), { type: 'log', message: args.join(' '), timestamp: new Date() }]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-50), { type: 'error', message: args.join(' '), timestamp: new Date() }]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev.slice(-50), { type: 'warn', message: args.join(' '), timestamp: new Date() }]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors duration-200"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <h3 className="text-sm font-medium">🐛 Debug Panel</h3>
        <div className="flex space-x-2">
          <button
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-700"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-700"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="h-full overflow-y-auto p-3">
        {/* Component Data */}
        {Object.keys(componentData).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Component Data:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(componentData, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Console Logs */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Console Logs:</h4>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded ${
                  log.type === 'error' ? 'bg-red-100 text-red-800' :
                  log.type === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <span className="text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                {' '}
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
