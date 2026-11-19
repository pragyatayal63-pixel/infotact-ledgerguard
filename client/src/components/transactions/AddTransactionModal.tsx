import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { BillingTransaction, Tenant, TransactionStatus } from '../../types/dashboard';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenant: Tenant;
  onCommitTransaction: (transaction: BillingTransaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  activeTenant,
  onCommitTransaction,
}) => {
  const [serviceName, setServiceName] = useState('API Gateway Invocations');
  const [category, setCategory] = useState<'API Gateway' | 'Database' | 'Storage' | 'Compute' | 'Other Services'>('API Gateway');
  const [amount, setAmount] = useState('450.00');
  const [units, setUnits] = useState('280,000 reqs');
  const [status, setStatus] = useState<TransactionStatus>('committed');
  const [notes, setNotes] = useState('Manual event record for batch processing');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount) || 100;
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();

    const newTx: BillingTransaction = {
      id: `tx-${Date.now()}`,
      eventId: `EVT-${Math.floor(1000 + Math.random() * 9000)}-${randomHex}`,
      tenantId: activeTenant.id,
      serviceName,
      category,
      amount: numericAmount,
      status,
      timestamp: 'Just now',
      reference: `TX-REF-${Math.floor(1000 + Math.random() * 9000)}-${activeTenant.slug.substring(0, 4).toUpperCase()}`,
      units,
      notes,
    };

    onCommitTransaction(newTx);
    onClose();
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Service
            </label>
            <select
              value={serviceName}
              onChange={(e) => {
                const s = e.target.value;
                setServiceName(s);
                if (s.includes('Gateway')) setCategory('API Gateway');
                else if (s.includes('Database')) setCategory('Database');
                else if (s.includes('Compute')) setCategory('Compute');
                else if (s.includes('Storage')) setCategory('Storage');
                else setCategory('Other Services');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Metered Units / Scope
              </label>
              <input
                type="text"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="e.g. 250,000 reqs"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Transaction Event Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('committed')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  status === 'committed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Committed
              </button>
              <button
                type="button"
                onClick={() => setStatus('rolled_back')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                  status === 'rolled_back'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rolled Back (Demo)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Internal Reference Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>Record Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
