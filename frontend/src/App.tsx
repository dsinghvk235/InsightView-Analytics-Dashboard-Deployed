import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Analytics Dashboard</h1>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}

export default App
