import React, { useState } from 'react';
import { X, AlertOctagon, Info, Loader2, RefreshCw } from 'lucide-react';
import type { Tenant } from '../../types/dashboard';
import type { TransactionType, TransactionRecord } from '../../api/types';
import { api, ApiError } from '../../api/client';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenant: Tenant;
  onTransactionSuccess: (tx: TransactionRecord, newBalance: number, isReplay: boolean) => void;
  onTransactionRollback?: (rollbackInfo: {
    eventId: string;
    accountId: string;
    amount: number;
    type: TransactionType;
    currency: string;
    timestamp: string;
    reason: string;
  }) => void;
  onErrorNotification?: (title: string, message: string) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  activeTenant,
  onTransactionSuccess,
  onTransactionRollback,
  onErrorNotification,
}) => {
  const [eventId, setEventId] = useState<string>(() => crypto.randomUUID());
  const [accountId, setAccountId] = useState<string>('ACC001');
  const [type, setType] = useState<TransactionType>('credit');
  const [amount, setAmount] = useState<string>('10.00');
  const [currency, setCurrency] = useState<string>('INR');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateNewEventId = () => {
    setEventId(crypto.randomUUID());
    setModalNotice('Generated new Event ID for payment intent.');
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalNotice(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError('Amount must be a positive number greater than 0.');
      return;
    }

    if (!accountId.trim()) {
      setModalError('Account ID is required (e.g. ACC001).');
      return;
    }

    const cleanCurrency = currency.trim().toUpperCase();
    if (cleanCurrency.length !== 3) {
      setModalError('Currency must be a 3-letter code (e.g. INR or USD).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createTransaction({
        eventId,
        accountId: accountId.trim(),
        type,
        amount: parsedAmount,
        currency: cleanCurrency,
        simulateFailure: import.meta.env.DEV ? simulateFailure : undefined,
      });

      const { transaction, balance } = response.data;
      const isReplay = Boolean(response.idempotentReplay);

      setEventId(crypto.randomUUID());
      onTransactionSuccess(transaction, balance, isReplay);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'SIMULATED_FAILURE') {
          // Rollback demonstration
          const msg = 'Simulated failure: multi-document transaction safely aborted by backend. Balance remains unchanged.';
          setModalError(`Rollback Triggered (500): ${msg} (Event ID retained for retry)`);
          if (onTransactionRollback) {
            onTransactionRollback({
              eventId,
              accountId: accountId.trim(),
              amount: parsedAmount,
              type,
              currency: cleanCurrency,
              timestamp: new Date().toLocaleTimeString(),
              reason: 'Simulated failure: rollback demo',
            });
          }
        } else if (err.code === 'INSUFFICIENT_BALANCE') {
          setModalError('Insufficient Balance: Debit amount exceeds available account balance. (Event ID retained)');
          if (onErrorNotification) {
            onErrorNotification('Insufficient Balance', 'Debit failed: insufficient funds in account.');
          }
        } else if (err.code === 'REQUEST_IN_PROGRESS') {
          setModalError('Request in progress: A distributed lock is held for this tenant. Please retry with the same Event ID in a moment.');
        } else {
          setModalError(`Error (${err.code}): ${err.message}. (Event ID retained for retry)`);
        }
      } else {
        setModalError('Network error connecting to backend. Your Event ID has been retained for a safe retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Record Billing Transaction
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organization: <strong className="text-slate-800">{activeTenant.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notices & Errors */}
        {modalNotice && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center gap-2">
            <Info size={15} className="shrink-0" />
            <span>{modalNotice}</span>
          </div>
        )}

        {modalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertOctagon size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{modalError}</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Idempotency key <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">{eventId.slice(0, 8)}...</code> is preserved to prevent double-billing.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Idempotent Event ID Display */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <span>Idempotent Event ID</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-normal">
                  client generated
                </span>
              </label>
              <button
                type="button"
                onClick={handleGenerateNewEventId}
                disabled={isSubmitting}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium disabled:opacity-50"
                title="Only generate a new Event ID for a brand-new payment"
              >
                <RefreshCw size={11} />
                <span>New ID</span>
              </button>
            </div>
            <input
              type="text"
              value={eventId}
              readOnly
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              This exact ID is retained across retries to prevent duplicate billing via Redis distributed locks.
            </p>
          </div>

          {/* Account ID & Transaction Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Account ID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="ACC001"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Transaction Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="credit">Credit (+)</option>
                <option value="debit">Debit (-)</option>
              </select>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Currency
              </label>
              <input
                type="text"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="INR"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all uppercase"
              />
            </div>
          </div>

          {/* Simulate Failure Checkbox (DEV mode only) */}
          {import.meta.env.DEV && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-amber-900 block">
                    Simulate Failure (Mid-Review Rollback Demo)
                  </span>
                  <span className="text-[11px] text-amber-700 block mt-0.5 leading-relaxed">
                    Sends <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">simulateFailure: true</code> to backend. Triggers a 500 error &amp; atomic multi-document abort. Balance remains untouched.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing ACID Lock...</span>
                </>
              ) : (
                <span>Submit Transaction</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
