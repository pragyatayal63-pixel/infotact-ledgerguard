import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios' // 👇 Axios yahan import kiya hai
import { 
  Eye, EyeOff, ShieldCheck, Building, Mail, Key, 
  Zap, Lock, Shield, Fingerprint, Loader2, CheckCircle2 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { loginSession } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'sso-loading'>('idle')

  // 👇 Yahan real API call lagayi hai
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!tenantId || !email || !password) {
      alert('Please fill all fields.')
      return
    }
    
    setAuthStatus('loading')
    
    try {
      // Backend API par data bhej rahe hain
      const response = await axios.post('http://localhost:5000/api/login', {
        tenantId,
        email,
        password
      })

      // Agar login successful hua, toh backend se aane wale asli token aur user data ko context mein save karenge
      if (response.data.token) {
        setAuthStatus('success')
        const apiUser = response.data.user || {}
        loginSession(response.data.token, {
          name: apiUser.name || email.split('@')[0],
          role: apiUser.role || 'Security Admin',
          tenantName: apiUser.tenantName || tenantId,
          email
        })
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      }
    } catch (error) {
      // Agar password galat hua ya backend offline hua
      console.error("Login failed:", error)
      alert("Invalid Credentials ya Backend offline hai!")
      setAuthStatus('idle')
    }
  }

  const handleSSO = () => {
    setAuthStatus('sso-loading')
    setTimeout(() => {
      setAuthStatus('success')
      setTimeout(() => {
        loginSession('enterprise-secure-token-123', {
          name: email ? email.split('@')[0] : 'Priyanka',
          role: 'Security Admin',
          tenantName: tenantId || 'Company A',
          email
        })
        navigate('/dashboard')
      }, 1000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="h-16 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={28} />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-tight">LedgerGuard</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Zero-Knowledge Enclave</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 uppercase">ZK-EVM Mainnet Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 pt-16 flex items-center justify-center relative z-10 px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Telemetry (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full self-start shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Zero-Trust Cluster Online</span>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
                Institutional Confidentiality at Scale.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Execute enterprise billing reconciliations inside hardware-isolated zk-SNARK micro-enclaves. Non-custodial, mathematically provable, and cryptographically verified.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-500">
                    <Zap size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Proof Latency</span>
                    <span className="text-lg font-bold text-white">&lt; 11.4 ms</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-400 font-semibold">ZK-STARK v4</span>
                  <span className="text-xs text-slate-500">Halo2 Prover</span>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-500">
                    <Lock size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Shielded Run</span>
                    <span className="text-lg font-bold text-white">$4.82B+</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-emerald-500 font-semibold">100% Privacy</span>
                  <span className="text-xs text-slate-500">Q1 Run-Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="w-full lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              
              {/* Glow line top */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">LedgerGuard Enclave v4.2</h1>
                <p className="text-sm text-slate-400">Zero-Knowledge Cryptographic Billing Engine</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Tenant ID */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Organization ID</label>
                    <span className="text-[11px] text-slate-600">Dedicated Cluster</span>
                  </div>
                  <div className="relative">
                    <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="e.g. acme-corp"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-mono text-sm placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Enterprise Work Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@enterprise.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Cryptographic Passphrase</label>
                    <span className="text-[11px] text-slate-600">Hardware-Enforced</span>
                  </div>
                  <div className="relative">
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-mono text-sm placeholder:text-slate-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-xs mt-2">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-700 bg-slate-950 accent-blue-600" />
                    Remember this enclave
                  </label>
                  <a href="#" className="text-blue-500 hover:text-blue-400 font-medium">Forgot Keyphrase?</a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={authStatus !== 'idle'}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] mt-4 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {authStatus === 'idle' && (
                    <>Sign In to Protected Enclave <Shield size={18} /></>
                  )}
                  {authStatus === 'loading' && (
                    <>Generating ZK Witness Proof... <Loader2 size={18} className="animate-spin" /></>
                  )}
                  {authStatus === 'success' && (
                    <>Enclave Attestation Verified <CheckCircle2 size={18} className="text-emerald-400" /></>
                  )}
                </button>
              </form>

              {/* SSO Section */}
              <div className="relative my-8 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-slate-800"></div></div>
                <span className="relative bg-slate-900 px-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Or authenticate via
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={handleSSO}
                  className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white transition-all group"
                >
                  <Shield size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  SAML / Okta
                </button>
                <button 
                  type="button" 
                  onClick={handleSSO}
                  className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white transition-all group"
                >
                  <Fingerprint size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  FIDO2 Key
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}