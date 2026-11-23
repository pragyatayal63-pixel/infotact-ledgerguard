import React, { useState } from 'react';
import { Settings, Save, Building, Bell, Sliders, Check } from 'lucide-react';
import type { Tenant } from '../../types/dashboard';

interface EngineSettingsViewProps {
  activeTenant: Tenant;
}

export const EngineSettingsView: React.FC<EngineSettingsViewProps> = ({ activeTenant }) => {
  const [budgetThreshold, setBudgetThreshold] = useState('80');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [rollbackAlerts, setRollbackAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [currency, setCurrency] = useState('USD ($)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-4xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Engine Settings &amp; Preferences
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tenant parameters, alert thresholds, and dashboard display
          </p>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Check size={14} /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Tenant Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building size={15} className="text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">Tenant Information</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Organization Name
              </label>
              <input
                type="text"
                disabled
                defaultValue={activeTenant.name}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Tenant Tier
              </label>
              <input
                type="text"
                disabled
                defaultValue={activeTenant.tier}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Database Cluster
              </label>
              <input
                type="text"
                disabled
                defaultValue={activeTenant.databaseCluster}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Connection Pool Limit
              </label>
              <input
                type="text"
                disabled
                defaultValue={`${activeTenant.maxConnections} Max Connections`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Billing Preferences */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">Billing &amp; Budget Preferences</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Budget Alert Threshold (%)
              </label>
              <input
                type="number"
                value={budgetThreshold}
                onChange={(e) => setBudgetThreshold(e.target.value)}
                min="50"
                max="95"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Trigger visual alerts when current spend reaches this percentage of budget
              </p>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">Notification Preferences</h4>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900">Budget Warning Alerts</p>
                <p className="text-[11px] text-slate-500">Notify when approaching or exceeding soft-cap quotas</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900">Transaction Rollback Notifications</p>
                <p className="text-[11px] text-slate-500">Alert on network timeout aborts and state rollbacks</p>
              </div>
              <input
                type="checkbox"
                checked={rollbackAlerts}
                onChange={(e) => setRollbackAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <p className="font-semibold text-slate-900">Weekly Executive Digest</p>
                <p className="text-[11px] text-slate-500">Summary of resource consumption and billing run-rate</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Display Preferences */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm">Display Preferences</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Date Formatting
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 16/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/16/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-16)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Visual Theme
              </label>
              <input
                type="text"
                disabled
                defaultValue="Modern Light Theme (Active)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
