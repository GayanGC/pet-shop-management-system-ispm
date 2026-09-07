import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  CreditCard,
  Award,
  DollarSign,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { fetchSalesAnalytics, getCSVExportUrl } from '../../services/billingService';

function SalesAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchSalesAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      } else {
        setError(res.message || 'Failed to load financial analytics');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to analytics endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleExportCSV = () => {
    const url = getCSVExportUrl();
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '4paw_sales_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Aggregating live financial analytics & revenue reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadAnalytics}
          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-bold transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, dailySales, paymentMethodBreakdown, topSellingItems } = analytics || {};
  const totalRev = summary?.totalRevenue || 0;
  const cashRev = paymentMethodBreakdown?.Cash?.revenue || 0;
  const cardRev = paymentMethodBreakdown?.Card?.revenue || 0;
  const onlineRev = paymentMethodBreakdown?.Online?.revenue || 0;

  const cashPct = totalRev > 0 ? Math.round((cashRev / totalRev) * 100) : 0;
  const cardPct = totalRev > 0 ? Math.round((cardRev / totalRev) * 100) : 0;
  const onlinePct = totalRev > 0 ? Math.round((onlineRev / totalRev) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header & Top Action Bar */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-300" />
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Financial Intelligence
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            📈 Clinic Revenue & Financial Analytics
          </h2>
          <p className="text-xs text-teal-100 max-w-lg">
            Real-time transaction auditing, sales breakdown by payment method, and revenue growth.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📥 Export Sales Report (CSV)</span>
        </button>
      </div>

      {/* 2. Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-2xl font-black text-teal-700 font-mono mt-1 block">
              Rs. {totalRev.toFixed(2)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Invoices Generated</span>
            <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
              {summary?.totalInvoices || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Settled Paid Orders</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
              {summary?.paidInvoicesCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
            <span className="text-2xl font-black text-purple-700 font-mono mt-1 block">
              Rs. {(summary?.averageOrderValue || 0).toFixed(2)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Revenue Trend Visual Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Daily Revenue Timeline (LKR)</h3>
            <p className="text-[11px] text-slate-400">Recorded revenue growth trends across recent dates</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100">
            Live Database Sync
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {dailySales && dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
                <Tooltip
                  formatter={(val) => [`Rs. ${Number(val).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="totalAmount" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#tealGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
              No daily sales data available yet.
            </div>
          )}
        </div>
      </div>

      {/* 4. Two-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Payment Method Split */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">Payment Method Revenue Split</h3>
          </div>

          <div className="space-y-4">
            {/* Cash */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">💵 Cash Payments</span>
                <span className="font-mono text-slate-900">Rs. {cashRev.toFixed(2)} ({cashPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${cashPct}%` }}></div>
              </div>
            </div>

            {/* Card */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">💳 Card Payments</span>
                <span className="font-mono text-slate-900">Rs. {cardRev.toFixed(2)} ({cardPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${cardPct}%` }}></div>
              </div>
            </div>

            {/* Online */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1.5">🌐 Online Transfers</span>
                <span className="font-mono text-slate-900">Rs. {onlineRev.toFixed(2)} ({onlinePct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${onlinePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Top Performing Items */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Top 5 Best-Selling Products & Services</h3>
          </div>

          <div className="space-y-3">
            {topSellingItems && topSellingItems.length > 0 ? (
              topSellingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{item.itemName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Quantity Sold: {item.totalQuantity} units</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black text-slate-900">
                    Rs. {Number(item.totalRevenue).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No sales items recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesAnalytics;
