import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('App component mounted');
    console.log('React version:', React.version);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#111827',
        marginBottom: '1rem'
      }}>
        Debug Page
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Testing with inline styles (no Tailwind)
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Component Test
        </h2>
        <button style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;
