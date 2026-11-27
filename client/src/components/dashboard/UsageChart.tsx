import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart } from 'lucide-react';
import type { HistoricalUsagePoint, ServiceExpense, Tenant } from '../../types/dashboard';
import { formatUSD } from '../../data/mockData';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageChartProps {
  activeTenant: Tenant;
  historicalData: Record<string, HistoricalUsagePoint[]>;
  serviceExpenses: ServiceExpense[];
}

// WEEK 3 FEATURE: This component uses static demo data. Replace with real API aggregation endpoints.
export const UsageChart: React.FC<UsageChartProps> = ({
  activeTenant,
  historicalData,
  serviceExpenses,
}) => {
  const [timeScope, setTimeScope] = useState<'24H' | '7D' | '30D' | '6M'>('7D');
  const [metricView, setMetricView] = useState<'cost' | 'requests' | 'compute'>('cost');

  const points = historicalData[timeScope] || historicalData['7D'] || [];
  const labels = points.map((p) => p.timeLabel);

  // Line Chart dataset for Light Theme
  const lineChartData = {
    labels,
    datasets: [
      {
        label:
          metricView === 'cost'
            ? 'Spend ($ USD)'
            : metricView === 'requests'
            ? 'API Invocations (k Req)'
            : 'Compute Hours (vCPU-hrs)',
        data: points.map((p) =>
          metricView === 'cost'
            ? p.cost
            : metricView === 'requests'
            ? p.requests
            : p.computeHours
        ),
        borderColor:
          metricView === 'cost'
            ? '#2563EB'
            : metricView === 'requests'
            ? '#0D9488'
            : '#6366F1',
        backgroundColor:
          metricView === 'cost'
            ? 'rgba(37, 99, 235, 0.08)'
            : metricView === 'requests'
            ? 'rgba(13, 148, 136, 0.08)'
            : 'rgba(99, 102, 241, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor:
          metricView === 'cost'
            ? '#2563EB'
            : metricView === 'requests'
            ? '#0D9488'
            : '#6366F1',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#475569',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y ?? 0;
            if (metricView === 'cost') return ` Spend: $${val.toLocaleString()}`;
            if (metricView === 'requests') return ` Volume: ${val}k invocations`;
            return ` Compute: ${val} vCPU-hrs`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#F1F5F9',
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#F1F5F9',
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 11,
          },
          callback: (value) => {
            if (metricView === 'cost') return `$${value}`;
            return value;
          },
        },
      },
    },
  };

  // Doughnut Chart dataset for Light Theme
  const doughnutData = {
    labels: serviceExpenses.map((s) => s.service),
    datasets: [
      {
        data: serviceExpenses.map((s) => s.amount),
        backgroundColor: serviceExpenses.map((s) => s.color),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#475569',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.toLocaleString()} (${ctx.label})`,
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="space-y-4">
      {/* Week 3 Feature Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">📊 Demo Data — Week 3 Feature:</span>
          <span>Time-series metrics and cost analytics are simulated. Aggregation endpoints will be wired in Week 3.</span>
        </div>
        <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
          Planned Feature
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Historical Usage Line Chart (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        {/* Header with Title and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" />
                Historical Usage Cost Metrics
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Resource consumption and billing expenditure trends for {activeTenant.name}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Metric Toggle */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => setMetricView('cost')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  metricView === 'cost'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Spending ($)
              </button>
              <button
                onClick={() => setMetricView('requests')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  metricView === 'requests'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Invocations
              </button>
              <button
                onClick={() => setMetricView('compute')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  metricView === 'compute'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                vCPU
              </button>
            </div>

            {/* Time Scope Toggle */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              {(['24H', '7D', '30D', '6M'] as const).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setTimeScope(sc)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                    timeScope === sc
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative h-[280px] w-full pt-4">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

        {/* Chart Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Showing aggregation over selected {timeScope} interval
          </span>
          <span className="font-medium text-slate-700">
            Total Cycle: {formatUSD(activeTenant.currentSpend)}
          </span>
        </div>
      </div>

      {/* Expenditures by Service Doughnut Chart (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <PieChart size={17} className="text-blue-600" />
              Expenditures by Service
            </h3>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Current Cycle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution across cloud infrastructure
          </p>
        </div>

        {/* Doughnut Chart */}
        <div className="relative h-[190px] my-3 flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Total Spend
            </span>
            <span className="text-base font-bold text-slate-900">
              {formatUSD(activeTenant.currentSpend, false)}
            </span>
          </div>
        </div>

        {/* Service items list */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          {serviceExpenses.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-slate-700 font-medium truncate">{s.service}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-slate-600">
                <span className="font-semibold text-slate-900">{formatUSD(s.amount, false)}</span>
                <span className="text-slate-400 text-[11px]">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};
