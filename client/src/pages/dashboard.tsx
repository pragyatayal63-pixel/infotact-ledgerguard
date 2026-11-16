import { 
  LayoutDashboard, ReceiptText, BarChart3, Settings, LogOut, 
  ShieldCheck, Search, Bell, User, Cpu, DollarSign, Hourglass, 
  ChevronRight, Lock, Activity
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex">
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
          <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
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
              <span className="text-xs font-semibold text-white">Company A</span>
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
                <span className="text-sm font-medium text-white leading-none">Priyanka</span>
                <span className="text-xs text-blue-500 uppercase tracking-wider mt-1">Security Admin</span>
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
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Priyanka</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" />
                Zero-knowledge cluster operational. All billing proofs synchronized.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all">
              + New Invoicing Run
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Active Resources</span>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Cpu size={20} /></div>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-1">1,428</h3>
                <p className="text-sm text-emerald-500 flex items-center gap-1">+12.4% vs last cycle</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Billed</span>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><DollarSign size={20} /></div>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-1">$4.82M</h3>
                <p className="text-sm text-emerald-500 flex items-center gap-1">+8.2% QTD volume</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Pending Proofs</span>
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Hourglass size={20} /></div>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-1">38</h3>
                <p className="text-sm text-slate-400">est. ~$240,890.00 volume</p>
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
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-blue-400 flex items-center gap-2">
                      <Lock size={14} className="text-slate-500" /> 0x8F9a...2B4c
                    </td>
                    <td className="py-4 px-6 text-white font-medium">Acme Global Financial</td>
                    <td className="py-4 px-6 text-slate-400">SGX Prover Tier 3</td>
                    <td className="py-4 px-6 text-right font-medium text-white">$128,450.00</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ZK-Verified
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-blue-400 flex items-center gap-2">
                      <Lock size={14} className="text-slate-500" /> 0x3E1b...79Fa
                    </td>
                    <td className="py-4 px-6 text-white font-medium">Apex Therapeutics</td>
                    <td className="py-4 px-6 text-slate-400">ZK-STARK Batch</td>
                    <td className="py-4 px-6 text-right font-medium text-white">$42,800.00</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Settled
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-blue-400 flex items-center gap-2">
                      <Lock size={14} className="text-slate-500" /> 0x992c...D120
                    </td>
                    <td className="py-4 px-6 text-white font-medium">Vanguard Systems</td>
                    <td className="py-4 px-6 text-slate-400">Secure Enclave</td>
                    <td className="py-4 px-6 text-right font-medium text-white">$94,200.00</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  )
}