import { useState, useEffect } from 'react'
import './App.css'
import apiService from './services/api'

function App() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)

  useEffect(() => {
    // Check API health
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555'
    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(err => console.error('API health check failed:', err))

    // Load events and categories
    Promise.all([
      apiService.getEvents(),
      apiService.getCategories(),
    ])
      .then(([eventsData, categoriesData]) => {
        setEvents(eventsData)
        setCategories(categoriesData)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>LERA - Event Management</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>LERA - Event Management</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p>Make sure the backend server is running on http://localhost:5555</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>LERA - Event Management Platform</h1>
        {apiStatus && (
          <p style={{ color: 'green' }}>
            ✅ Backend API Status: {apiStatus.status}
          </p>
        )}
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Categories ({categories.length})</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <span
              key={cat.id}
              style={{
                padding: '0.5rem 1rem',
                background: '#646cff',
                color: 'white',
                borderRadius: '8px',
              }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2>Events ({events.length})</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '1rem',
          }}
        >
          {events.map(event => (
            <div
              key={event.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1.5rem',
                background: '#1a1a1a',
              }}
            >
              <h3>{event.title}</h3>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>
                {event.location}
              </p>
              <p style={{ marginTop: '0.5rem' }}>{event.description}</p>
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  ${event.price}
                </span>
                <span style={{ color: '#888' }}>
                  Capacity: {event.capacity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
