import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, ReceiptText, BarChart3, Settings, LogOut, 
  ShieldCheck, Search, Bell, User, Cpu, DollarSign, Hourglass, 
  ChevronRight, Lock, Activity, Loader2, X, PlusCircle, 
  CheckCircle2, AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

interface TransactionItem {
  id: string;
  hash: string;
  client: string;
  serviceType: string;
  amount: string;
  status: string;
}

interface DashboardData {
  activeResources: number;
  totalBilled: string;
  pendingProofs: number;
  transactions: TransactionItem[];
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, token, logoutSession } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  // Modal states for "+ New Invoicing Run"
  const [isRunModalOpen, setIsRunModalOpen] = useState(false)
  const [clientName, setClientName] = useState('')
  const [serviceType, setServiceType] = useState('SGX Prover Tier 3')
  const [amount, setAmount] = useState('')
  const [submittingRun, setSubmittingRun] = useState(false)

  const displayName = user?.name || 'Priyanka'
  const displayRole = user?.role || 'Security Admin'
  const displayTenant = user?.tenantName || 'Company A'

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  // 🔄 Backend se real data fetch karne ka function
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const authToken = token || localStorage.getItem('ledgerToken')
        
        // Backend API call with Authorization Header
        const response = await axios.get('http://localhost:5000/api/dashboard-stats', {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })

        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch dashboard stats, using fallback mock data:", error)
        
        // Fallback data agar backend offline ho ya API ready na ho
        setData({
          activeResources: 1428,
          totalBilled: "$4.82M",
          pendingProofs: 38,
          transactions: [
            { id: '1', hash: '0x8F9a...2B4c', client: 'Acme Global Financial', serviceType: 'SGX Prover Tier 3', amount: '$128,450.00', status: 'ZK-Verified' },
            { id: '2', hash: '0x3E1b...79Fa', client: 'Apex Therapeutics', serviceType: 'ZK-STARK Batch', amount: '$42,800.00', status: 'Settled' },
            { id: '3', hash: '0x992c...D120', client: 'Vanguard Systems', serviceType: 'Secure Enclave', amount: '$94,200.00', status: 'Pending' }
          ]
        })
        setLoading(false)
        showToast('Backend offline — displaying local enclave fallback data.', 'error')
      }
    }

    fetchDashboardData()
  }, [token])

  const generateProofHash = () => {
    const chars = '0123456789abcdefABCDEF'
    const pick = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `0x${pick(4)}...${pick(4)}`
  }

  const formatUsdAmount = (rawValue: string) => {
    const numeric = Number(rawValue.replace(/[^0-9.]/g, ''))
    if (Number.isNaN(numeric) || numeric <= 0) return '$0.00'
    return numeric.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })
  }

  // 🚀 "+ New Invoicing Run" submit handler
  const handleCreateInvoicingRun = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clientName.trim() || !amount.trim()) {
      showToast('Please enter both Client Organization and Billing Amount.', 'error')
      return
    }

    setSubmittingRun(true)
    const authToken = token || localStorage.getItem('ledgerToken')
    const formattedAmount = formatUsdAmount(amount)

    const newTransaction: TransactionItem = {
      id: String(Date.now()),
      hash: generateProofHash(),
      client: clientName.trim(),
      serviceType,
      amount: formattedAmount,
      status: 'Pending'
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/invoicing-runs',
        {
          tenantId: displayTenant,
          client: newTransaction.client,
          serviceType: newTransaction.serviceType,
          amount: newTransaction.amount
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )

      const createdItem: TransactionItem = response.data?.transaction || newTransaction

      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          activeResources: prev.activeResources + 1,
          pendingProofs: prev.pendingProofs + 1,
          transactions: [createdItem, ...prev.transactions]
        }
      })
      showToast(`Invoicing run queued for ${createdItem.client}.`, 'success')
    } catch (error) {
      console.error("Invoicing run API unavailable, adding locally:", error)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          activeResources: prev.activeResources + 1,
          pendingProofs: prev.pendingProofs + 1,
          transactions: [newTransaction, ...prev.transactions]
        }
      })
      showToast(`Added ${newTransaction.client} locally (API offline).`, 'success')
    } finally {
      setSubmittingRun(false)
      setClientName('')
      setServiceType('SGX Prover Tier 3')
      setAmount('')
      setIsRunModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex">
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/90 border-red-500/40 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white transition-colors ml-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col justify-between py-6 shadow-xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.2)]">
              <ShieldCheck size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">LedgerGuard</span>
              <span className="text-xs text-slate-500 tracking-wider uppercase mt-0.5">ZK-Engine v4.2</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2 px-4">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-500 font-medium">
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
              <ReceiptText size={20} />
              <span>Billing Ledger</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        <div className="px-4">
          <button 
            onClick={() => {
              logoutSession()
              navigate('/login')
            }} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="pl-72 w-full flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 h-16 bg-slate-950/80 backdrop-blur-md z-40 border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400">Active Tenant:</span>
              <span className="text-xs font-semibold text-white">{displayTenant}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Find proof or tx hash..." 
                className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors w-64 text-white placeholder:text-slate-500"
              />
            </div>
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-medium text-white leading-none">{displayName}</span>
                <span className="text-xs text-blue-500 uppercase tracking-wider mt-1">{displayRole}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User size={18} className="text-slate-300" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 p-8">
          
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {displayName}</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" />
                Zero-knowledge cluster operational. All billing proofs synchronized.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setIsRunModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              + New Invoicing Run
            </button>
          </div>

          {loading ? (
            <>
              {/* Stats Skeleton Loaders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
                {[0, 1, 2].map((cardIdx) => (
                  <div
                    key={cardIdx}
                    className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between h-40"
                  >
                    <div className="flex justify-between items-start">
                      <div className="h-3 w-28 bg-slate-800 rounded" />
                      <div className="h-9 w-9 bg-slate-800 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-9 w-24 bg-slate-800 rounded" />
                      <div className="h-3.5 w-32 bg-slate-800/80 rounded" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Skeleton Loader */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden animate-pulse">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div className="h-5 w-44 bg-slate-800 rounded" />
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                </div>
                <div className="divide-y divide-slate-800">
                  {[0, 1, 2].map((rowIdx) => (
                    <div key={rowIdx} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="h-4 w-28 bg-slate-800 rounded" />
                      <div className="h-4 w-40 bg-slate-800 rounded" />
                      <div className="h-4 w-32 bg-slate-800 rounded" />
                      <div className="h-4 w-24 bg-slate-800 rounded" />
                      <div className="h-6 w-20 bg-slate-800 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Active Resources</span>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Cpu size={20} /></div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-1">{data?.activeResources}</h3>
                    <p className="text-sm text-emerald-500 flex items-center gap-1">+12.4% vs last cycle</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Billed</span>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><DollarSign size={20} /></div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-1">{data?.totalBilled}</h3>
                    <p className="text-sm text-emerald-500 flex items-center gap-1">+8.2% QTD volume</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Pending Proofs</span>
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Hourglass size={20} /></div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-white mb-1">{data?.pendingProofs}</h3>
                    <p className="text-sm text-slate-400">cryptographic verifications</p>
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
                  <button className="text-sm text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1">
                    View Full Ledger <ChevronRight size={16} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="py-4 px-6 font-medium">Transaction Hash</th>
                        <th className="py-4 px-6 font-medium">Client</th>
                        <th className="py-4 px-6 font-medium">Service Type</th>
                        <th className="py-4 px-6 font-medium text-right">Amount (USD)</th>
                        <th className="py-4 px-6 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {data?.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6 font-mono text-blue-400 flex items-center gap-2">
                            <Lock size={14} className="text-slate-500" /> {tx.hash}
                          </td>
                          <td className="py-4 px-6 text-white font-medium">{tx.client}</td>
                          <td className="py-4 px-6 text-slate-400">{tx.serviceType}</td>
                          <td className="py-4 px-6 text-right font-medium text-white">{tx.amount}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              tx.status === 'ZK-Verified' ? 'bg-emerald-500/10 text-emerald-500' :
                              tx.status === 'Settled' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                tx.status === 'ZK-Verified' ? 'bg-emerald-500' :
                                tx.status === 'Settled' ? 'bg-blue-500' :
                                'bg-amber-500 animate-pulse'
                              }`}></span> {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          
        </main>
      </div>

      {/* "+ New Invoicing Run" Modal */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="text-blue-500" size={20} />
                <h2 className="text-lg font-bold text-white">New Invoicing Run</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRunModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoicingRun} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Client Organization
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Meridian Capital"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Enclave Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="SGX Prover Tier 3">SGX Prover Tier 3</option>
                  <option value="ZK-STARK Batch">ZK-STARK Batch</option>
                  <option value="Secure Enclave">Secure Enclave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Billing Amount (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 65000"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRun}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-70"
                >
                  {submittingRun ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <span>Launch Run</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}