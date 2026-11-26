import React from 'react';
import { Plus, Download } from 'lucide-react';
import type { Tenant, UserProfile } from '../../types/dashboard';

interface ExecutiveHeaderProps {
  activeTenant: Tenant;
  user: UserProfile;
  onOpenRecordModal: () => void;
  onExportStatement: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  activeTenant,
  user,
  onOpenRecordModal,
  onExportStatement,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
      {/* Left: Tenant Identity & Status */}
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeTenant.name}
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {activeTenant.tier}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            DB Pool: {activeTenant.queryLatencyMs}ms (Healthy)
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Welcome back, <span className="font-semibold text-slate-700">{user.name}</span>. Multi-tenant zero-knowledge billing engine monitoring database isolation, distributed mutex locks, and transaction rollback resiliency.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onExportStatement}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Download size={14} className="text-slate-500" />
          <span>Export Statement</span>
        </button>

        <button
          onClick={onOpenRecordModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Record Event</span>
        </button>
      </div>
    </div>
  );
};
