import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, CreditCard, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { loadCards, loadTransactions } from '@/lib/store';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [cards] = useState(loadCards);
  const [txns] = useState(loadTransactions);

  const stats = useMemo(() => {
    const totalCashback = txns.reduce((s, t) => s + t.cashback, 0);
    const missedSavings = txns.reduce((s, t) => s + (t.missedSavings || 0), 0);
    const cardCashback: Record<string, number> = {};
    txns.forEach(t => { cardCashback[t.cardId] = (cardCashback[t.cardId] || 0) + t.cashback; });
    const bestCardId = Object.entries(cardCashback).sort(([,a],[,b]) => b - a)[0]?.[0];
    const bestCard = cards.find(c => c.id === bestCardId);
    return { totalCashback, missedSavings, bestCard, totalTxns: txns.length };
  }, [cards, txns]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your credit card rewards at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cashback This Month"
          value={`₹${stats.totalCashback.toLocaleString()}`}
          icon={<IndianRupee className="h-4 w-4" />}
          accent
        />
        <StatCard
          title="Best Performing Card"
          value={stats.bestCard?.name || '—'}
          subtitle={stats.bestCard?.bank}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Missed Savings"
          value={`₹${stats.missedSavings}`}
          subtitle="Lost by using wrong card"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          title="Total Transactions"
          value={String(stats.totalTxns)}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Recent Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Recent Transactions</h2>
          <Link to="/recommend">
            <Button variant="outline" size="sm" className="gap-1 text-primary border-primary/30 hover:bg-primary/10">
              Find Best Card <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Merchant</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-left font-medium">Card</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Cashback</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(txn => {
                const card = cards.find(c => c.id === txn.cardId);
                return (
                  <tr key={txn.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{txn.merchant}</td>
                    <td className="px-5 py-3 text-muted-foreground">{txn.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">{card?.name || txn.cardId}</td>
                    <td className="px-5 py-3 text-right">₹{txn.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-success font-medium">₹{txn.cashback}</span>
                      {txn.missedSavings ? (
                        <span className="text-destructive text-xs ml-1">(-₹{txn.missedSavings})</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
