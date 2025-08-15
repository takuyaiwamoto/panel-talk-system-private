import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ControllerPage from './pages/ControllerPage'
import DisplayPage from './pages/DisplayPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ControllerPage />} />
        <Route path="/controller" element={<ControllerPage />} />
        <Route path="/display" element={<DisplayPage />} />
      </Routes>
    </div>
  )
}

export default App