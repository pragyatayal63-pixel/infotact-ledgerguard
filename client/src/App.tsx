import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Dashboard from './pages/dashboard'

// 🛡️ Security Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('ledgerToken')
  
  if (!token) {
    // Agar token nahi hai, toh wapas login par bhej do
    return <Navigate to="/login" replace />
  }
  
  // Agar token hai, toh andar aane do
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard ko ab Security Guard (ProtectedRoute) ke andar pack kar diya */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App