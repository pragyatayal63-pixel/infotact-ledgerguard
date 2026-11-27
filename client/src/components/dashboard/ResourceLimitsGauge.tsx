import React from 'react';
import {
  Gauge,
  Cpu,
  Database,
  Globe,
  HardDrive,
} from 'lucide-react';
import type { ResourceMetric, Tenant } from '../../types/dashboard';
import { formatUSD, formatCompact } from '../../data/mockData';

interface ResourceLimitsGaugeProps {
  activeTenant: Tenant;
  resources: ResourceMetric[];
}

export const ResourceLimitsGauge: React.FC<ResourceLimitsGaugeProps> = ({
  activeTenant,
  resources,
}) => {
  const percentUsed = Math.min(
    100,
    Math.round((activeTenant.currentSpend / activeTenant.monthlyBudget) * 100)
  );
  const remainingBudget = Math.max(0, activeTenant.monthlyBudget - activeTenant.currentSpend);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Network':
        return Globe;
      case 'Database':
        return Database;
      case 'Compute':
        return Cpu;
      default:
        return HardDrive;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Gauge size={18} className="text-blue-600" />
              Active Resource Consumption &amp; Quotas
            </h3>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                percentUsed > 80
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {percentUsed}% Utilized
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Resource usage caps and allocation thresholds for {activeTenant.name}
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-500">Monthly Budget: </span>
          <span className="font-bold text-slate-900">
            {formatUSD(activeTenant.monthlyBudget, false)}
          </span>
        </div>
      </div>

      {/* Monthly Budget Summary Banner */}
      <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Current Billing Spend
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {formatUSD(activeTenant.currentSpend)}
              <span className="text-xs text-slate-500 font-normal ml-2">
                of {formatUSD(activeTenant.monthlyBudget)} budget
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Remaining Buffer</span>
              <span className="font-bold text-emerald-600">
                {formatUSD(remainingBudget)}
              </span>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div>
              <span className="text-slate-500 text-[11px] block">Cluster Status</span>
              <span className="font-bold text-blue-600">
                {activeTenant.status}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentUsed > 90
                ? 'bg-rose-500'
                : percentUsed > 75
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>0%</span>
          <span className="font-medium text-slate-600">
            {formatUSD(remainingBudget)} remaining before monthly threshold
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Itemized Resources */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Service Resource Limits
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resources.map((res) => {
            const Icon = getCategoryIcon(res.category);
            const isWarning = res.percentage >= 80;

            return (
              <div
                key={res.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{res.name}</p>
                      <p className="text-[11px] text-slate-500">{res.category}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-bold text-slate-900 text-xs">
                        {formatCompact(res.used)} {res.unit}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        / {formatCompact(res.limit)} {res.unit}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600">
                      {formatUSD(res.cost, false)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWarning ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, res.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
