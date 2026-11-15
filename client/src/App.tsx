import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'

function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">
        Welcome to LedgerGuard Dashboard
      </h1>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App