import React, { useState } from 'react';
import { X, Plus, Play, RotateCcw, CheckCircle2, AlertOctagon, Clock, ShieldAlert } from 'lucide-react';
import type { BillingTransaction, Tenant, TransactionStatus } from '../../types/dashboard';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenant: Tenant;
  onCommitTransaction: (transaction: BillingTransaction) => void;
  onUpdateTransactionStatus?: (id: string, status: TransactionStatus, notes?: string) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  activeTenant,
  onCommitTransaction,
  onUpdateTransactionStatus,
}) => {
  const [serviceName, setServiceName] = useState('API Gateway Invocations');
  const [category, setCategory] = useState<'API Gateway' | 'Database' | 'Storage' | 'Compute' | 'Other Services'>('API Gateway');
  const [amount, setAmount] = useState('450.00');
  const [units, setUnits] = useState('280,000 reqs');
  const [status, setStatus] = useState<TransactionStatus>('committed');
  const [notes, setNotes] = useState('Manual event record for batch processing');

  // Interactive Review Demonstration Mode
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string>('');

  if (!isOpen) return null;

  const generateTx = (customStatus: TransactionStatus, customNotes: string): BillingTransaction => {
    const numericAmount = parseFloat(amount) || 100;
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();

    return {
      id: `tx-${Date.now()}`,
      eventId: `EVT-${Math.floor(1000 + Math.random() * 9000)}-${randomHex}`,
      tenantId: activeTenant.id,
      serviceName,
      category,
      amount: numericAmount,
      status: customStatus,
      timestamp: 'Just now',
      reference: `TX-REF-${Math.floor(1000 + Math.random() * 9000)}-${activeTenant.slug.substring(0, 4).toUpperCase()}`,
      units,
      notes: customNotes,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx = generateTx(status, notes);
    onCommitTransaction(newTx);
    onClose();
  };

  // Scenario 1: Successful Transaction Lifecycle (Pending -> Committed)
  const handleRunSuccessLifecycle = () => {
    setIsSimulating(true);
    setSimulationStep('Submitting transaction: Acquiring distributed lock & entering PENDING state...');

    const newTx = generateTx('pending', 'Acquiring lock & opening multi-document session...');
    onCommitTransaction(newTx);

    setTimeout(() => {
      setSimulationStep('Validating tenant session & committing ACID records...');
      if (onUpdateTransactionStatus) {
        onUpdateTransactionStatus(
          newTx.id,
          'committed',
          'Transaction committed successfully. Distributed lock released. Single-charge verified.'
        );
      }
      setIsSimulating(false);
      setSimulationStep('');
      onClose();
    }, 1800);
  };

  // Scenario 2: Failed Transaction (Non-Rollback: Pending -> Failed)
  const handleRunFailureLifecycle = () => {
    setIsSimulating(true);
    setSimulationStep('Submitting transaction: Validating payload & tenant quotas...');

    const newTx = generateTx('pending', 'Validating payload against tenant schema...');
    onCommitTransaction(newTx);

    setTimeout(() => {
      setSimulationStep('Validation error: Quota exceeded or invalid payload. Marked as FAILED.');
      if (onUpdateTransactionStatus) {
        onUpdateTransactionStatus(
          newTx.id,
          'failed',
          'Failed pre-flight schema or tenant balance validation. Operation rejected with zero balance change.'
        );
      }
      setIsSimulating(false);
      setSimulationStep('');
      onClose();
    }, 1800);
  };

  // Scenario 3: Mid-Flight Network Failure & ACID Rollback (Pending -> Timeout -> Rolled Back)
  const handleRunRollbackLifecycle = () => {
    setIsSimulating(true);
    setSimulationStep('Initiating multi-document write session in PENDING state...');

    const newTx = generateTx('pending', 'Processing multi-document ledger write session...');
    onCommitTransaction(newTx);

    setTimeout(() => {
      setSimulationStep('Mid-flight network dropout detected! Aborting transaction & triggering rollback...');
    }, 1000);

    setTimeout(() => {
      if (onUpdateTransactionStatus) {
        onUpdateTransactionStatus(
          newTx.id,
          'rolled_back',
          'Simulated mid-flight network timeout. Multi-document transaction aborted and state safely rolled back. No duplicate charge incurred.'
        );
      }
      setIsSimulating(false);
      setSimulationStep('');
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Record New Billing Event
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organization: {activeTenant.name}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSimulating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mid-Project Review Interactive Demonstration Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Play size={13} className="text-blue-600" />
              Mid-Project Review State Resiliency Demo
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Controlled Simulation
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Demonstrate real-time transactional lifecycle resilience. Watch state transitions live in the ledger:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRunSuccessLifecycle}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50/50 hover:border-emerald-300 text-emerald-800 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <CheckCircle2 size={15} className="text-emerald-600 mb-1" />
              <span>1. Success</span>
              <span className="text-[9px] text-slate-400 font-normal">Pending &rarr; Commit</span>
            </button>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRunFailureLifecycle}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50/50 hover:border-rose-300 text-rose-800 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <AlertOctagon size={15} className="text-rose-600 mb-1" />
              <span>2. Fail</span>
              <span className="text-[9px] text-slate-400 font-normal">Pending &rarr; Failed</span>
            </button>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRunRollbackLifecycle}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-900 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RotateCcw size={15} className="text-amber-600 mb-1" />
              <span>3. Rollback</span>
              <span className="text-[9px] text-amber-700/80 font-normal">Timeout &rarr; Revert</span>
            </button>
          </div>

          {isSimulating && (
            <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2 text-xs text-blue-800 animate-pulse">
              <Clock size={14} className="animate-spin text-blue-600 shrink-0" />
              <span className="font-medium text-[11px]">{simulationStep}</span>
            </div>
          )}
        </div>

        {/* Form Body for Direct Entry */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Service
            </label>
            <select
              value={serviceName}
              disabled={isSimulating}
              onChange={(e) => {
                const s = e.target.value;
                setServiceName(s);
                if (s.includes('Gateway')) setCategory('API Gateway');
                else if (s.includes('Database')) setCategory('Database');
                else if (s.includes('Compute')) setCategory('Compute');
                else if (s.includes('Storage')) setCategory('Storage');
                else setCategory('Other Services');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 cursor-pointer disabled:opacity-60"
            >
              <option value="API Gateway Invocations">API Gateway Invocations</option>
              <option value="Database Cluster Shards">Database Cluster Shards</option>
              <option value="Elastic Worker Compute">Elastic Worker Compute</option>
              <option value="Encrypted Snapshot Storage">Encrypted Snapshot Storage</option>
              <option value="Event Log Ingestion">Event Log Ingestion</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Charge Amount ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isSimulating}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-medium disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Metered Units / Scope
              </label>
              <input
                type="text"
                disabled={isSimulating}
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="e.g. 250,000 reqs"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Direct Target Status
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                disabled={isSimulating}
                onClick={() => setStatus('committed')}
                className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition-colors ${
                  status === 'committed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Committed
              </button>
              <button
                type="button"
                disabled={isSimulating}
                onClick={() => setStatus('pending')}
                className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition-colors ${
                  status === 'pending'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                disabled={isSimulating}
                onClick={() => setStatus('failed')}
                className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition-colors ${
                  status === 'failed'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Failed
              </button>
              <button
                type="button"
                disabled={isSimulating}
                onClick={() => setStatus('rolled_back')}
                className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition-colors ${
                  status === 'rolled_back'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rolled Back
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Internal Reference Note
            </label>
            <textarea
              value={notes}
              disabled={isSimulating}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 text-xs disabled:opacity-60"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldAlert size={12} className="text-slate-400" />
              ACID Safe &bull; Idempotent
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSimulating}
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Plus size={14} />
                <span>Record Event</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
