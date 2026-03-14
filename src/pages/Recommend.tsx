import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { loadCards } from '@/lib/store';
import { recommendCards, CATEGORIES, Category, RecommendationResult } from '@/lib/data';
import CreditCardUI from '@/components/CreditCardUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Recommend() {
  const [cards] = useState(loadCards);
  const [nlInput, setNlInput] = useState('');
  const [category, setCategory] = useState<Category>('Dining');
  const [amount, setAmount] = useState('');
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const parseNL = (input: string): { category: Category; amount: number } | null => {
    const amountMatch = input.match(/₹?\s*(\d[\d,]*)/);
    const amt = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0;
    if (!amt) return null;
    const lower = input.toLowerCase();
    let cat: Category = 'Other';
    if (/swiggy|zomato|dine|dinner|lunch|breakfast|restaurant|food/.test(lower)) cat = 'Dining';
    else if (/flipkart|amazon|shop|myntra|online|buy/.test(lower)) cat = 'Shopping';
    else if (/fuel|petrol|diesel|bpcl|hp|ioc/.test(lower)) cat = 'Fuel';
    else if (/travel|flight|hotel|makemytrip|trip|booking/.test(lower)) cat = 'Travel';
    else if (/movie|netflix|hotstar|entertain|spotify/.test(lower)) cat = 'Entertainment';
    return { category: cat, amount: amt };
  };

  const handleNL = () => {
    const parsed = parseNL(nlInput);
    if (!parsed) {
      toast({ title: 'Could not parse', description: 'Please include an amount and merchant/category.', variant: 'destructive' });
      return;
    }
    runRecommend(parsed.category, parsed.amount);
  };

  const handleManual = () => {
    if (!amount) return;
    runRecommend(category, Number(amount));
  };

  const runRecommend = (cat: Category, amt: number) => {
    if (cards.length === 0) {
      toast({ title: 'No cards', description: 'Add cards first to get recommendations.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      setResults(recommendCards(cards, cat, amt));
      setLoading(false);
    }, 800);
  };

  const copyName = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    toast({ title: 'Copied!', description: `${name} copied to clipboard.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const winner = results?.[0];
  const winnerCard = winner ? cards.find(c => c.id === winner.cardId) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Smart Recommend</h1>
        <p className="text-muted-foreground mt-1">Find the best card for any purchase</p>
      </div>

      {/* NL Input */}
      <div className="glass-card p-6 gold-glow">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={nlInput}
            onChange={e => setNlInput(e.target.value)}
            placeholder="e.g. paid ₹1500 on Swiggy for dinner..."
            className="flex-1 bg-secondary border-border text-base h-12"
            onKeyDown={e => e.key === 'Enter' && handleNL()}
          />
          <Button onClick={handleNL} className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
            <Sparkles className="h-4 w-4" /> Analyze with AI ✦
          </Button>
        </div>
      </div>

      {/* Manual Fallback */}
      <div className="glass-card p-6">
        <p className="text-sm text-muted-foreground mb-4">Or enter details manually:</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={category} onValueChange={v => setCategory(v as Category)}>
            <SelectTrigger className="sm:w-48 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              className="pl-7 bg-secondary border-border"
              onKeyDown={e => e.key === 'Enter' && handleManual()}
            />
          </div>
          <Button onClick={handleManual} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
            Find Best Card
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="shimmer h-40 rounded-xl" />
          <div className="shimmer h-20 rounded-xl" />
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6 animate-slide-up">
          {/* Winner */}
          {winnerCard && winner && (
            <div className="glass-card p-6 gold-glow border-primary/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="gold-gradient text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  🏆 USE THIS CARD
                </span>
                <span className="text-sm text-muted-foreground">Best for this purchase</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <CreditCardUI card={winnerCard} highlight />
                <div className="flex flex-col justify-center space-y-2">
                  <p className="text-3xl font-display font-bold text-primary">₹{winner.cashback.toFixed(2)}</p>
                  <p className="text-muted-foreground">cashback at {winner.rewardPercent}% reward rate</p>
                  {results.length > 1 && (
                    <p className="text-sm text-success">
                      You save ₹{(winner.cashback - results[1].cashback).toFixed(2)} more than {results[1].name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {results.length > 1 && (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h2 className="font-display font-semibold">All Cards Ranked</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="px-5 py-3 text-left font-medium">Rank</th>
                      <th className="px-5 py-3 text-left font-medium">Card</th>
                      <th className="px-5 py-3 text-left font-medium">Bank</th>
                      <th className="px-5 py-3 text-right font-medium">Reward %</th>
                      <th className="px-5 py-3 text-right font-medium">You Earn</th>
                      <th className="px-5 py-3 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={r.cardId}
                        className={`border-b border-border/30 transition-colors ${
                          i === 0 ? 'bg-primary/5' : 'hover:bg-secondary/30'
                        }`}
                      >
                        <td className="px-5 py-3">
                          {i === 0 ? <span className="text-primary font-bold">🥇</span> : i + 1}
                        </td>
                        <td className="px-5 py-3 font-medium">{r.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.bank}</td>
                        <td className="px-5 py-3 text-right">{r.rewardPercent}%</td>
                        <td className="px-5 py-3 text-right font-medium text-success">₹{r.cashback.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => copyName(r.name, r.cardId)} className="text-muted-foreground hover:text-primary transition-colors">
                            {copiedId === r.cardId ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
