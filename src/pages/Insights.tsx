import { useState, useMemo } from 'react';
import { loadCards, loadTransactions } from '@/lib/store';
import { Category, CATEGORIES } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const CHART_COLORS = ['hsl(43,96%,56%)', 'hsl(210,80%,50%)', 'hsl(152,69%,50%)', 'hsl(280,60%,50%)', 'hsl(15,80%,50%)', 'hsl(195,70%,45%)'];

export default function Insights() {
  const [cards] = useState(loadCards);
  const [txns] = useState(loadTransactions);

  const { categoryData, cardCashback, totalCashback, optimizationScore, missedTotal } = useMemo(() => {
    const catSpend: Record<string, number> = {};
    const cardCb: Record<string, number> = {};
    let total = 0;
    let missed = 0;

    txns.forEach(t => {
      catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
      const card = cards.find(c => c.id === t.cardId);
      const name = card?.name || t.cardId;
      cardCb[name] = (cardCb[name] || 0) + t.cashback;
      total += t.cashback;
      missed += t.missedSavings || 0;
    });

    const categoryData = CATEGORIES.map(c => ({ name: c, value: catSpend[c] || 0 })).filter(d => d.value > 0);
    const cardCashback = Object.entries(cardCb).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const optimizationScore = total > 0 ? Math.round((total / (total + missed)) * 100) : 100;

    return { categoryData, cardCashback, totalCashback: total, optimizationScore, missedTotal: missed };
  }, [cards, txns]);

  const annualProjection = totalCashback * 12;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Insights</h1>
        <p className="text-muted-foreground mt-1">Understand your spending & rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Optimization Score */}
        <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Optimization Score</p>
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222,30%,18%)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(43,96%,56%)"
                strokeWidth="8"
                strokeDasharray={`${optimizationScore * 2.64} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-display font-bold text-primary">{optimizationScore}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {optimizationScore >= 80 ? 'Great card usage!' : 'Room for improvement'}
          </p>
        </div>

        {/* Annual Projection */}
        <div className="glass-card p-6 flex flex-col justify-center gold-glow border-primary/20">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Annual Projection</p>
          <p className="text-4xl font-display font-bold text-primary">₹{annualProjection.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">estimated cashback this year</p>
        </div>

        {/* Missed Savings */}
        <div className="glass-card p-6 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Missed Savings</p>
          <p className="text-3xl font-display font-bold text-destructive">₹{missedTotal}</p>
          <p className="text-sm text-muted-foreground mt-2">lost by using non-optimal cards</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-lg mb-6">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(222,41%,10%)', border: '1px solid hsl(222,30%,18%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cashback per Card */}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-lg mb-6">Cashback per Card</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cardCashback} layout="vertical">
              <XAxis type="number" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(222,41%,10%)', border: '1px solid hsl(222,30%,18%)', borderRadius: 8, color: 'hsl(210,40%,96%)' }}
                formatter={(value: number) => [`₹${value}`, 'Cashback']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {cardCashback.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
