import React from 'react';
import {
  CreditCard,
  Database,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type { Tenant } from '../../types/dashboard';
import { formatUSD } from '../../data/mockData';

interface SummaryCardsProps {
  activeTenant: Tenant;
  committedCount: number;
  rolledBackCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  activeTenant,
  committedCount,
  rolledBackCount,
}) => {
  const usagePercentage = Math.round(
    (activeTenant.currentSpend / activeTenant.monthlyBudget) * 100
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1: Current Billing Spend */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Current Billing Spend
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <CreditCard size={17} />
            </div>
          </div>

          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatUSD(activeTenant.currentSpend)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Monthly Budget: <span className="font-semibold text-slate-700">{formatUSD(activeTenant.monthlyBudget)}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span>Usage</span>
            <span className="font-semibold text-slate-900">{usagePercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercentage > 85
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Dynamic DB Isolation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Dynamic DB Isolation
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Database size={17} />
            </div>
          </div>

          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTenant.queryLatencyMs} ms
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Benchmark: <span className="font-medium text-emerald-600">Below 5.0 ms</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Active: <strong className="text-slate-700">{activeTenant.activeConnections}/{activeTenant.maxConnections}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={11} /> Healthy
          </span>
        </div>
      </div>

      {/* Card 3: Idempotent Ledger Events */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Idempotent Ledger Events
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Layers size={17} />
            </div>
          </div>

          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {committedCount} Committed
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rolled Back: <span className="font-semibold text-amber-600">{rolledBackCount}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Duplicate Charges: <strong className="text-slate-700">0</strong></span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Operational
          </span>
        </div>
      </div>

      {/* Card 4: System Health */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              System Health
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Activity size={17} />
            </div>
          </div>

          <div className="mt-2.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              99.9%
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Active Services: <span className="font-semibold text-slate-700">5</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Failed Services: <strong className="text-slate-700">0</strong></span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={11} /> Operational
          </span>
        </div>
      </div>
    </div>
  );
};
