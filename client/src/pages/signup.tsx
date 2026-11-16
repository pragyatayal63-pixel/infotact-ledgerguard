
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff } from 'lucide-react'

function Signup() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters.')
      return
    }

    alert('Account creation UI is working! Backend will be connected later.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <ShieldCheck size={30} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            LedgerGuard
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Secure. Smart. Reliable.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-slate-900">
            Create an account
          </h2>

          <p className="text-slate-500 text-sm mt-2 mb-7">
            Get started with your LedgerGuard account.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Create Account
            </button>

          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>

        </div>

        <p className="text-center text-slate-500 text-xs mt-7">
          © 2026 LedgerGuard. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default Signup
