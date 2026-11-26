import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertOctagon,
  FileSpreadsheet,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
} from 'lucide-react';
import type { BillingTransaction } from '../../types/dashboard';
import { formatUSD } from '../../data/mockData';

interface LedgerTableProps {
  transactions: BillingTransaction[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenRecordModal: () => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactions,
  searchTerm,
  onSearchChange,
  onOpenRecordModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'committed' | 'pending' | 'failed' | 'rolled_back'>('all');
  const [selectedTx, setSelectedTx] = useState<BillingTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter logic
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || tx.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const exportCSV = () => {
    const headers = 'EventID,Service,Category,Amount,Status,Timestamp,Reference\n';
    const rows = filtered
      .map(
        (t) =>
          `"${t.eventId}","${t.serviceName}","${t.category}","${t.amount}","${t.status}","${t.timestamp}","${t.reference}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerguard-records-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                Idempotent Billing Ledger
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filtered.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive log of transactional events with idempotency tracking and status verification
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenRecordModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Plus size={14} />
              <span>Record Event</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Event ID, service name, or reference..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center flex-wrap bg-slate-100/80 p-1 rounded-xl text-xs font-semibold self-start md:self-auto gap-1">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setStatusFilter('committed');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'committed'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Committed
            </button>
            <button
              onClick={() => {
                setStatusFilter('pending');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => {
                setStatusFilter('failed');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'failed'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Failed
            </button>
            <button
              onClick={() => {
                setStatusFilter('rolled_back');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'rolled_back'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Rolled Back
            </button>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Event ID</th>
              <th className="py-3 px-4">Service Name</th>
              <th className="py-3 px-4">Units / Scope</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-5 text-center">Status</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Transaction Reference</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="font-semibold text-slate-600 text-sm">
                    No transactions found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search criteria
                  </p>
                </td>
              </tr>
            ) : (
              currentItems.map((tx) => {
                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tx.eventId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {tx.serviceName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {tx.units}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatUSD(tx.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {tx.status === 'committed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Committed
                        </span>
                      )}
                      {tx.status === 'rolled_back' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <RotateCcw size={11} /> Rolled Back
                        </span>
                      )}
                      {(tx.status === 'processing' || tx.status === 'pending') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock size={11} className="animate-spin" /> {tx.status === 'pending' ? 'Pending' : 'Processing'}
                        </span>
                      )}
                      {tx.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertOctagon size={11} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {tx.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {tx.reference}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 sm:px-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * itemsPerPage, filtered.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-700">{filtered.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>
          <span className="px-2 text-slate-600 font-semibold">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">
                Transaction Event Details
              </h4>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Event ID</span>
                <span className="font-semibold text-slate-900">{selectedTx.eventId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-900">{selectedTx.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Units</span>
                <span className="font-semibold text-slate-900">{selectedTx.units}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-slate-900">{formatUSD(selectedTx.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 items-center">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-900">
                  {selectedTx.status === 'committed' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={10} /> Committed
                    </span>
                  )}
                  {selectedTx.status === 'rolled_back' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <RotateCcw size={10} /> Rolled Back
                    </span>
                  )}
                  {(selectedTx.status === 'processing' || selectedTx.status === 'pending') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock size={10} className="animate-spin" /> {selectedTx.status === 'pending' ? 'Pending' : 'Processing'}
                    </span>
                  )}
                  {selectedTx.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertOctagon size={10} /> Failed
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-slate-700">{selectedTx.reference}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-700">{selectedTx.timestamp}</span>
              </div>

              {selectedTx.notes && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-[11px] leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-0.5">Notes:</p>
                  {selectedTx.notes}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
