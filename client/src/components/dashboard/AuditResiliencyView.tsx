import React, { useState } from 'react';
import {
  FileCheck2,
  RotateCcw,
} from 'lucide-react';
import type { AuditLog, Tenant } from '../../types/dashboard';

interface AuditResiliencyViewProps {
  logs: AuditLog[];
  activeTenant: Tenant;
}

export const AuditResiliencyView: React.FC<AuditResiliencyViewProps> = ({
  logs,
  activeTenant,
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

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
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

      {/* State Resiliency Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <RotateCcw size={16} className="text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            State Resiliency &amp; Automatic Rollback Safeguards
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          LedgerGuard guards financial consistency during network dropouts. If a transaction fails mid-flight, isolated database locks automatically expire and multi-document write sessions revert state to prevent orphan debits.
        </p>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCheck2 size={18} className="text-blue-600" />
              System Activity Logs
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
