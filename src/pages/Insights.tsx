import { useState, useMemo } from 'react';
import { loadCards, loadTransactions } from '@/lib/store';
import { CATEGORIES } from '@/lib/data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

const CHART_COLORS = [
  'hsl(243, 75%, 59%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 91%, 71%)',
  'hsl(280, 60%, 50%)',
  'hsl(195, 70%, 45%)',
];

const MONTHLY_TREND = [
  { month: 'Oct', cashback: 680 },
  { month: 'Nov', cashback: 920 },
  { month: 'Dec', cashback: 1100 },
  { month: 'Jan', cashback: 850 },
  { month: 'Feb', cashback: 1050 },
  { month: 'Mar', cashback: 552 },
];

const MISSED_TABLE = [
  { month: 'Jan', spent: 18500, earned: 850, optimal: 1020, missed: 170, efficiency: 83 },
  { month: 'Feb', spent: 22000, earned: 1050, optimal: 1250, missed: 200, efficiency: 84 },
  { month: 'Mar', spent: 14600, earned: 552, optimal: 630, missed: 78, efficiency: 88 },
];

export default function Insights() {
  const [cards] = useState(loadCards);
  const [txns] = useState(loadTransactions);
  const [dateRange, setDateRange] = useState('This Month');

  const { categoryData, cardCashback, totalCashback, totalSpent, optimizationScore, missedTotal } = useMemo(() => {
    const catSpend: Record<string, number> = {};
    const cardCb: Record<string, number> = {};
    let total = 0;
    let spent = 0;
    let missed = 0;

    txns.forEach(t => {
      catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
      const card = cards.find(c => c.id === t.cardId);
      const name = card?.name || t.cardId;
      cardCb[name] = (cardCb[name] || 0) + t.cashback;
      total += t.cashback;
      spent += t.amount;
      missed += t.missedSavings || 0;
    });

    const categoryData = CATEGORIES.map(c => ({ name: c, value: catSpend[c] || 0 })).filter(d => d.value > 0);
    const cardCashback = Object.entries(cardCb).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const optimizationScore = total > 0 ? Math.round((total / (total + missed)) * 100) : 100;

    return { categoryData, cardCashback, totalCashback: total, totalSpent: spent, optimizationScore, missedTotal: missed };
  }, [cards, txns]);

  const tooltipStyle = {
    backgroundColor: 'hsl(0, 0%, 100%)',
    border: '1px solid hsl(214, 32%, 91%)',
    borderRadius: 8,
    color: 'hsl(222, 47%, 11%)',
    fontSize: 12,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Spending Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Understand your spending & rewards</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {['This Month', 'Last 3 Months', 'This Year'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                dateRange === range ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl font-display font-bold text-foreground mt-2">₹{totalSpent.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cashback</p>
          <p className="text-2xl font-display font-bold text-emerald mt-2">₹{totalCashback.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card p-5 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(214, 32%, 91%)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(243, 75%, 59%)"
                strokeWidth="8"
                strokeDasharray={`${optimizationScore * 2.64} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-display font-bold text-foreground">{optimizationScore}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Optimization Score</p>
            <p className="text-sm text-muted-foreground mt-1">
              {optimizationScore >= 80 ? 'Great usage!' : 'Room to improve'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-card p-6">
          <h2 className="font-display font-semibold text-base mb-6">Spending by Category</h2>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium text-foreground ml-auto">₹{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-card p-6">
          <h2 className="font-display font-semibold text-base mb-6">Cashback by Card</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cardCashback} layout="vertical">
              <XAxis type="number" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value}`, 'Cashback']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(243, 75%, 59%)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3: Monthly trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-card p-6">
        <h2 className="font-display font-semibold text-base mb-6">Monthly Cashback Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={MONTHLY_TREND}>
            <defs>
              <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value}`, 'Cashback']} />
            <Area type="monotone" dataKey="cashback" stroke="hsl(243, 75%, 59%)" strokeWidth={2} fill="url(#indigoGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Row 4: Missed Savings Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-semibold text-base">Missed Savings Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Month</th>
                <th className="px-5 py-3 text-right font-medium">Spent</th>
                <th className="px-5 py-3 text-right font-medium">Earned</th>
                <th className="px-5 py-3 text-right font-medium">Optimal</th>
                <th className="px-5 py-3 text-right font-medium">Missed</th>
                <th className="px-5 py-3 text-right font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {MISSED_TABLE.map((row, i) => (
                <tr key={row.month} className={`border-b border-border/60 ${i % 2 === 0 ? 'bg-background' : ''}`}>
                  <td className="px-5 py-3 font-medium text-foreground">{row.month}</td>
                  <td className="px-5 py-3 text-right text-foreground">₹{row.spent.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-emerald font-medium">₹{row.earned}</td>
                  <td className="px-5 py-3 text-right text-foreground">₹{row.optimal}</td>
                  <td className="px-5 py-3 text-right text-coral font-medium">₹{row.missed}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-medium ${row.efficiency >= 85 ? 'text-emerald' : 'text-coral'}`}>{row.efficiency}%</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-secondary font-semibold">
                <td className="px-5 py-3 text-foreground">Total</td>
                <td className="px-5 py-3 text-right text-foreground">₹{MISSED_TABLE.reduce((s, r) => s + r.spent, 0).toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-emerald">₹{MISSED_TABLE.reduce((s, r) => s + r.earned, 0)}</td>
                <td className="px-5 py-3 text-right text-foreground">₹{MISSED_TABLE.reduce((s, r) => s + r.optimal, 0)}</td>
                <td className="px-5 py-3 text-right text-coral">₹{MISSED_TABLE.reduce((s, r) => s + r.missed, 0)}</td>
                <td className="px-5 py-3 text-right text-foreground">
                  {Math.round(MISSED_TABLE.reduce((s, r) => s + r.earned, 0) / MISSED_TABLE.reduce((s, r) => s + r.optimal, 0) * 100)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
