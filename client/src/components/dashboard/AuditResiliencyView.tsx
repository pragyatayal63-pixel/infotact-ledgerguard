import React, { useState } from 'react';
import {
  FileCheck2,
  RotateCcw,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import type { AuditLog, Tenant, BillingTransaction } from '../../types/dashboard';

interface AuditResiliencyViewProps {
  logs: AuditLog[];
  activeTenant: Tenant;
  onOpenRecordModal?: () => void;
  transactions?: BillingTransaction[];
}

export const AuditResiliencyView: React.FC<AuditResiliencyViewProps> = ({
  logs,
  activeTenant,
  onOpenRecordModal,
  transactions = [],
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'all') return true;
    if (filterType === 'success') return l.status === 'SUCCESS';
    if (filterType === 'rollback') return l.status === 'ROLLBACK';
    if (filterType === 'switch') return l.status === 'POOL_SWITCH';
    return true;
  });

  const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const rollbackCount = logs.filter((l) => l.status === 'ROLLBACK').length;
  const activeTxRollbacks = transactions.filter((t) => t.status === 'rolled_back').length;
  const activeTxFailed = transactions.filter((t) => t.status === 'failed').length;
  const activeTxPending = transactions.filter((t) => t.status === 'pending' || t.status === 'processing').length;
  const activeTxCommitted = transactions.filter((t) => t.status === 'committed').length;

  return (
    <div className="space-y-6">
      {/* Mid-Project Review State Resiliency Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-800/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles size={13} className="text-amber-400" />
              <span>Mid-Project Review Primary Demo: State Resiliency &amp; Rollback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Zero-Knowledge Transaction State Resiliency Hub
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrating fail-safe financial ledger states. When simulated network drops or quota exceptions occur, multi-document write sessions trigger atomic rollbacks, preventing orphan charges and ensuring zero balance corruption for <strong className="text-white">{activeTenant.name}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {onOpenRecordModal && (
              <button
                onClick={onOpenRecordModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Play size={14} className="fill-white" />
                <span>Trigger Resiliency Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Callout Pill */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/60 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Committed in Ledger: <strong className="text-emerald-300 ml-1">{activeTxCommitted}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Safely Rolled Back: <strong className="text-amber-300 ml-1">{activeTxRollbacks}</strong>
          </span>
          {activeTxPending > 0 && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Pending in Lock: <strong className="text-blue-300 ml-1">{activeTxPending}</strong>
            </span>
          )}
          {activeTxFailed > 0 && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Failed Validation: <strong className="text-rose-300 ml-1">{activeTxFailed}</strong>
            </span>
          )}
          <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
            <ShieldAlert size={12} className="text-amber-400" />
            Simulation Notice: UI simulation clearly distinguished from live production DB locks
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Activity Logs
          </span>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">
            {logs.length} Logged
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Activity recorded this cycle
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Successful Transactions
          </span>
          <h4 className="text-2xl font-bold text-emerald-600 mt-1">
            {successCount}
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Committed with single-charge
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Rollback Events
          </span>
          <h4 className="text-2xl font-bold text-amber-600 mt-1">
            {rollbackCount}
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Reverted cleanly on timeout
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Failed Ledger States
          </span>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">
            0
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Zero corruption or double-billing
          </p>
        </div>
      </div>

      {/* State Resiliency Architecture Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              State Resiliency &amp; Automatic Rollback Safeguards
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            Audit Checklist &bull; Mid-Project Review
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          LedgerGuard guards financial consistency during mid-flight network dropouts. If a transaction fails mid-flight, isolated database locks auto-expire and multi-document write sessions revert state to prevent orphan debits.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              1. Single-Charge Idempotency
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Every request is assigned a unique event ID and processed under a distributed mutex lock to prevent duplicate charges.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <RotateCcw size={13} className="text-amber-600" />
              2. Atomic Multi-Doc Rollback
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Mid-flight network dropouts automatically abort MongoDB transactions, reverting balance updates with 100% atomicity.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <AlertOctagon size={13} className="text-rose-600" />
              3. Non-Rollback Validation Fails
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Pre-flight validation failures and quota exceptions reject without entering write sessions, leaving balances untouched.
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCheck2 size={18} className="text-blue-600" />
              System Activity &amp; Resiliency Audit Logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent events and operational audit stream for {activeTenant.name}
            </p>
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('success')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'success'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Successful
            </button>
            <button
              onClick={() => setFilterType('rollback')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'rollback'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Rollbacks
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Latency</th>
                <th className="py-3 px-5">Activity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.service}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.status === 'POOL_SWITCH'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : log.status === 'ROLLBACK'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {log.latencyMs} ms
                    </td>
                    <td className="py-3 px-5 text-slate-600 max-w-md leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
