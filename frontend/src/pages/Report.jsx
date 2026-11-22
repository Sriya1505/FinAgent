import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  AlertTriangle,
  Repeat,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileCode,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { FinancialTooltip } from '../components/FinancialTooltip';
import { CategoryTransactionsModal } from '../components/finny';

export default function Report({ currentUser }) {
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Period filter states: 'monthly' | 'quarterly' | 'yearly'
  const [periodType, setPeriodType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedQuarter, setSelectedQuarter] = useState('Q4');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Category modal inspection
  const [inspectCategory, setInspectCategory] = useState(null);

  const loadReport = async (month) => {
    setLoading(true);
    try {
      const [rData, txRes] = await Promise.all([
        api.getReport(month),
        api.getTransactions().catch(() => ({ transactions: [] }))
      ]);
      setReport(rData);
      const safeTxs = Array.isArray(txRes) ? txRes : (txRes?.transactions || []);
      setTransactions(safeTxs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Determine the month to fetch based on periodType
    let targetMonth = selectedMonth;
    if (periodType === 'quarterly') {
      const qMonthMap = { Q1: '03', Q2: '06', Q3: '09', Q4: '11' };
      targetMonth = `${selectedYear}-${qMonthMap[selectedQuarter] || '11'}`;
    } else if (periodType === 'yearly') {
      targetMonth = `${selectedYear}-11`;
    }
    loadReport(targetMonth);
  }, [periodType, selectedMonth, selectedQuarter, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  // Export Report as CSV
  const handleExportCSV = () => {
    if (!report) return;
    const { executive_summary, category_breakdown, flagged_anomalies, active_recurring_expenses } = report;

    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += 'FinAgent Financial Audit Statement\n';
    csv += `Billing Period,${report.billing_period}\n`;
    csv += `Generated At,${new Date(report.generated_at).toLocaleString()}\n`;
    csv += `Audit ID,${report.report_id}\n\n`;

    // 1. Executive Summary
    csv += '1. EXECUTIVE FINANCIAL SUMMARY\n';
    csv += 'Metric,Amount (INR)\n';
    csv += `Total Income,${executive_summary.total_income}\n`;
    csv += `Total Expenses,${executive_summary.total_expense}\n`;
    csv += `Net Savings,${executive_summary.net_savings}\n`;
    csv += `Savings Rate,${executive_summary.savings_rate_pct}%\n\n`;

    // 2. Category Breakdown
    csv += '2. CATEGORY-WISE EXPENDITURE\n';
    csv += 'Category,Amount (INR),Share of Total (%)\n';
    Object.entries(category_breakdown || {}).forEach(([cat, amt]) => {
      const share = executive_summary.total_expense > 0 
        ? ((amt / executive_summary.total_expense) * 100).toFixed(1) 
        : '0.0';
      csv += `"${cat}",${amt},${share}%\n`;
    });
    csv += '\n';

    // 3. Flagged Outliers
    csv += '3. FLAGGED OUTLIERS\n';
    csv += 'Date,Description,Category,Amount (INR),Severity,Reason\n';
    (flagged_anomalies || []).forEach(anom => {
      csv += `"${anom.date}","${anom.description.replace(/"/g, '""')}","${anom.category}",${anom.amount},"${anom.severity}","${(anom.reason || '').replace(/"/g, '""')}"\n`;
    });
    csv += '\n';

    // 4. Subscriptions
    csv += '4. RECURRING SUBSCRIPTIONS\n';
    csv += 'Name,Frequency,Monthly Amount (INR),Annual Cost (INR)\n';
    (active_recurring_expenses || []).forEach(rec => {
      csv += `"${rec.name.replace(/"/g, '""')}","${rec.frequency}",${rec.average_amount},${rec.annual_cost}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finagent-statement-${report.billing_period.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Report as JSON
  const handleExportJSON = () => {
    if (!report) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const a = document.createElement('a');
    a.href = jsonString;
    a.download = `finagent-statement-${report.billing_period.replace(/\s+/g, '-')}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20"></div>
          </div>
          <div className="text-center font-mono">
            <p className="text-xs font-bold text-cyan-400 glow-text-cyan tracking-wider uppercase">Generating Financial Statement...</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Auditing verified transactions via Python Engine</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm font-mono">
        Unable to load report.
      </div>
    );
  }

  const { executive_summary, category_breakdown, budget_performance, flagged_anomalies, active_recurring_expenses, savings_goals_status } = report;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-x-hidden print:p-0 print:m-0 print:max-w-none print:w-full">
      
      {/* Action Bar (hidden when printing) */}
      <div className="print:hidden glass-panel-glow hud-corner p-5 rounded-3xl border border-cyan-500/25 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Financial Statement & Audit Reports
                <FinancialTooltip term="python_verified" size="sm" />
              </h3>
            </div>
          </div>

          {/* Period Selector Switcher (Monthly, Quarterly, Yearly) */}
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <div className="bg-slate-900/90 p-1 rounded-xl border border-cyan-500/25 flex items-center gap-1 text-xs">
              {['monthly', 'quarterly', 'yearly'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setPeriodType(mode)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    periodType === mode
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Inputs based on periodType */}
            {periodType === 'monthly' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs glass-input rounded-xl font-mono text-slate-200 border border-cyan-500/30"
              />
            )}

            {periodType === 'quarterly' && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs glass-input rounded-xl font-mono text-slate-200 border border-cyan-500/30 bg-slate-900"
                >
                  <option value="Q1">Q1 (Jan - Mar)</option>
                  <option value="Q2">Q2 (Apr - Jun)</option>
                  <option value="Q3">Q3 (Jul - Sep)</option>
                  <option value="Q4">Q4 (Oct - Dec)</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-2.5 py-1.5 text-xs glass-input rounded-xl font-mono text-slate-200 border border-cyan-500/30 bg-slate-900"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            )}

            {periodType === 'yearly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 text-xs glass-input rounded-xl font-mono text-slate-200 border border-cyan-500/30 bg-slate-900"
              >
                <option value="2026">Year 2026</option>
                <option value="2025">Year 2025</option>
                <option value="2024">Year 2024</option>
              </select>
            )}
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="pt-3 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 font-mono">
          <span className="text-[11px] text-slate-400">
            Export verified financial ledger statements:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Download structured CSV dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Download raw audit payload JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:opacity-90 text-black rounded-xl text-xs font-extrabold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="print-sheet glass-panel hud-corner p-6 sm:p-10 md:p-12 rounded-3xl border border-cyan-500/20 shadow-2xl space-y-8 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0 print:space-y-6">
        
        {/* Document Header & Official Statement Letterhead */}
        <div className="border-b-2 border-cyan-500/20 print:border-slate-800 pb-6 print:pb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#38bdf8] via-[#0284c7] to-[#2563eb] text-white flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.35)] shrink-0 print:bg-blue-600 print:shadow-none">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4h14a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2v2.8h7.6a1 1 0 011 1v2.2a1 1 0 01-1 1H9.2V20H5V4z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white print:text-slate-900 tracking-tight">FinAgent Financial Audit Statement</h1>
                </div>
              </div>
            </div>

            {/* Official Metadata Box */}
            <div className="text-right text-xs font-mono bg-[#050c18] print:bg-slate-50 p-3 rounded-xl border border-cyan-500/20 print:border-slate-300 shrink-0">
              <span className="font-bold text-cyan-300 print:text-slate-900 block text-sm">Period: {report.billing_period}</span>
              <span className="text-slate-400 print:text-slate-500 block text-[10px] mt-0.5">
                Generated: {new Date(report.generated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Account Holder Bar */}
          {currentUser && (
            <div className="mt-4 pt-3 border-t border-cyan-500/15 print:border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 print:text-slate-600">
              <div>
                <span className="text-slate-500">Account Holder: </span>
                <span className="font-bold text-white print:text-slate-900">{currentUser.name}</span>
                <span className="mx-2 text-slate-600 print:text-slate-300">|</span>
                <span>{currentUser.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Executive Summary Cards */}
        <section className="space-y-3 break-inside-avoid print:space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-slate-900 font-mono">
              1. Executive Financial Summary
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3 font-mono">
            <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-500/20 print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase flex items-center gap-1">
                Total Income
                <span className="print:hidden"><FinancialTooltip term="inflow" size="sm" /></span>
              </span>
              <span className="text-xl font-black text-emerald-400 glow-text-cyan print:text-emerald-700 block mt-1">
                ₹{Number(executive_summary.total_income || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-500/20 print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase flex items-center gap-1">
                Total Expenses
                <span className="print:hidden"><FinancialTooltip term="outflow" size="sm" /></span>
              </span>
              <span className="text-xl font-black text-rose-400 print:text-rose-700 block mt-1">
                ₹{Number(executive_summary.total_expense || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-500/20 print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase flex items-center gap-1">
                Net Savings
                <span className="print:hidden"><FinancialTooltip term="current_balance" size="sm" /></span>
              </span>
              <span className="text-xl font-black text-white print:text-slate-900 block mt-1">
                ₹{Number(executive_summary.net_savings || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#050c18] border border-cyan-500/20 print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase flex items-center gap-1">
                Savings Rate
                <span className="print:hidden"><FinancialTooltip term="savings_rate" size="sm" /></span>
              </span>
              <span className="text-xl font-black text-cyan-400 glow-text-cyan print:text-indigo-700 block mt-1">
                {executive_summary.savings_rate_pct}%
              </span>
            </div>
          </div>
        </section>

        {/* Category Breakdown Table */}
        <section className="space-y-3 break-inside-avoid print:space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-slate-900 font-mono">
              2. Category-Wise Expenditure Breakdown
            </h2>
            <span className="text-[11px] font-mono text-cyan-400/80 print:hidden">
              Click any category row to inspect transactions
            </span>
          </div>

          <div className="border border-cyan-500/15 print:border-slate-300 rounded-xl overflow-hidden print:rounded-lg">
            {Object.keys(category_breakdown || {}).length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#050c18] text-slate-400 font-bold border-b border-cyan-500/15 print:bg-slate-100 print:text-slate-700 font-mono">
                  <tr>
                    <th className="py-2.5 px-4 print:py-2">Category</th>
                    <th className="py-2.5 px-4 text-right print:py-2">Amount (₹)</th>
                    <th className="py-2.5 px-4 text-right print:py-2">Share of Outflow</th>
                    <th className="py-2.5 px-4 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 print:divide-slate-200 font-mono">
                  {Object.entries(category_breakdown || {}).map(([cat, amt]) => {
                    const share = executive_summary.total_expense > 0 
                      ? ((amt / executive_summary.total_expense) * 100).toFixed(1) 
                      : 0;
                    return (
                      <tr 
                        key={cat} 
                        onClick={() => setInspectCategory(cat)}
                        className="hover:bg-cyan-500/10 print:hover:bg-transparent cursor-pointer transition-colors group print:text-slate-800"
                      >
                        <td className="py-2.5 px-4 font-semibold text-slate-200 print:text-slate-900 print:py-2 flex items-center gap-2">
                          <span className="group-hover:text-cyan-300 print:group-hover:text-slate-900 transition-colors">{cat}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-white print:text-slate-900 print:py-2">
                          ₹{Number(amt || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 print:text-slate-600 print:py-2">{share}%</td>
                        <td className="py-2.5 px-4 text-center print:hidden">
                          <span className="text-[10px] text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                            View →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Print Total Row */}
                <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-mono font-bold text-slate-900 hidden print:table-footer-group">
                  <tr>
                    <td className="py-2 px-4">Total Outflow</td>
                    <td className="py-2 px-4 text-right">₹{Number(executive_summary.total_expense || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2 px-4 text-right">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 print:text-slate-600 font-mono bg-[#050c18] print:bg-slate-50">
                No categorized expenses recorded for this period.
              </div>
            )}
          </div>
        </section>

        {/* Budget Performance */}
        <section className="space-y-3 break-inside-avoid print:space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-slate-900 font-mono">
            3. Monthly Budget Allocation vs Actual
          </h2>
          {budget_performance && budget_performance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2.5 font-mono">
              {budget_performance.map(b => (
                <div key={b.budget_id} className="p-3.5 rounded-xl border border-cyan-500/15 bg-[#050c18] flex items-center justify-between text-xs print:bg-slate-50 print:border-slate-300 print:p-2.5 print:rounded-lg">
                  <div>
                    <span className="font-bold text-white print:text-slate-900 block">{b.category}</span>
                    <span className="text-[11px] text-slate-400 print:text-slate-600">
                      Allocated Cap: ₹{Number(b.spending_limit || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-cyan-300 print:text-slate-900 block">
                      ₹{Number(b.spending_limit || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 print:text-emerald-800 bg-emerald-500/20 print:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-500/30 print:border-emerald-300">
                      Active Cap
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-cyan-500/15 bg-[#050c18] text-center text-xs text-slate-400 print:text-slate-600 font-mono print:bg-slate-50 print:border-slate-300">
              No category budgets configured for this billing period.
            </div>
          )}
        </section>

        {/* Flagged Outliers & Recurring Subscriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 font-mono break-inside-avoid">
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-slate-900 flex items-center gap-1.5">
              <span>4. Flagged Outliers ({flagged_anomalies.length})</span>
              <span className="print:hidden"><FinancialTooltip term="anomaly" size="sm" /></span>
            </h2>
            {flagged_anomalies.length === 0 ? (
              <p className="text-xs text-slate-400 print:text-slate-600 italic p-3 bg-[#050c18] rounded-xl border border-cyan-500/15 print:bg-slate-50 print:border-slate-300">
                No abnormal transactions recorded for this period.
              </p>
            ) : (
              flagged_anomalies.map((anom, i) => (
                <div key={i} className="p-3 bg-amber-500/10 print:bg-amber-50 rounded-xl border border-amber-500/25 print:border-amber-300 text-xs text-amber-200 print:text-amber-900">
                  <div className="flex justify-between font-bold text-white print:text-slate-900">
                    <span>{anom.description}</span>
                    <span className="text-amber-300 print:text-amber-800">₹{Number(anom.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 print:text-slate-600 mt-1">{anom.reason}</p>
                </div>
              ))
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-slate-900">
              5. Active Subscriptions & Bills
            </h2>
            {active_recurring_expenses && active_recurring_expenses.length > 0 ? (
              <div className="space-y-1.5">
                {active_recurring_expenses.slice(0, 4).map((rec, i) => (
                  <div key={i} className="p-2.5 bg-[#050c18] print:bg-slate-50 rounded-xl border border-cyan-500/15 print:border-slate-300 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 print:text-slate-900 block truncate">{rec.name}</span>
                      <span className="text-[10px] text-slate-500">{rec.frequency}</span>
                    </div>
                    <span className="font-bold text-cyan-300 print:text-slate-900">₹{Number(rec.average_amount || 0).toLocaleString('en-IN')}/mo</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 print:text-slate-600 italic p-3 bg-[#050c18] rounded-xl border border-cyan-500/15 print:bg-slate-50 print:border-slate-300">
                No recurring subscriptions detected for this period.
              </p>
            )}
          </section>
        </div>


      </div>

      {/* Category Transactions Modal */}
      {inspectCategory && (
        <CategoryTransactionsModal
          category={inspectCategory}
          transactions={transactions}
          onClose={() => setInspectCategory(null)}
        />
      )}
    </div>
  );
}
