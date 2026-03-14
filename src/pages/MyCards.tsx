import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreditCardUI from '@/components/CreditCardUI';
import { loadCards, saveCards } from '@/lib/store';
import { CreditCard, CATEGORIES, BANKS, QUICK_ADD_CARDS, Category } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function MyCards() {
  const [cards, setCards] = useState<CreditCard[]>(loadCards);
  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState('');
  const [name, setName] = useState('');
  const [rewards, setRewards] = useState<Record<Category, number>>(
    Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<Category, number>
  );
  const [cap, setCap] = useState('');
  const { toast } = useToast();

  const addCard = () => {
    if (!bank || !name) return;
    const card: CreditCard = {
      id: `custom-${Date.now()}`,
      bank,
      name,
      rewards: { ...rewards },
      monthlyCap: cap ? Number(cap) : undefined,
    };
    const updated = [...cards, card];
    setCards(updated);
    saveCards(updated);
    setOpen(false);
    resetForm();
    toast({ title: 'Card Added', description: `${name} has been added to your wallet.` });
  };

  const quickAdd = (card: CreditCard) => {
    if (cards.some(c => c.id === card.id)) {
      toast({ title: 'Already Added', description: `${card.name} is already in your wallet.`, variant: 'destructive' });
      return;
    }
    const updated = [...cards, card];
    setCards(updated);
    saveCards(updated);
    toast({ title: 'Card Added', description: `${card.name} added via quick add.` });
  };

  const resetForm = () => {
    setBank(''); setName(''); setCap('');
    setRewards(Object.fromEntries(CATEGORIES.map(c => [c, 0])) as Record<Category, number>);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">My Cards</h1>
          <p className="text-muted-foreground mt-1">Manage your credit card portfolio</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add Credit Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Bank</Label>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select bank" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Card Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Regalia Gold" className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-sm font-medium">Reward % by Category</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {CATEGORIES.map(cat => (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24">{cat}</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.25}
                        value={rewards[cat]}
                        onChange={e => setRewards(r => ({ ...r, [cat]: Number(e.target.value) }))}
                        className="bg-secondary border-border h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Monthly Cashback Cap (₹, optional)</Label>
                <Input type="number" value={cap} onChange={e => setCap(e.target.value)} placeholder="e.g. 1000" className="bg-secondary border-border" />
              </div>
              <Button onClick={addCard} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Add Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No cards added yet. Add your first card to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(card => (
            <CreditCardUI key={card.id} card={card} />
          ))}
        </div>
      )}

      {/* Quick Add */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Quick Add Popular Cards</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD_CARDS.map(card => (
            <Button
              key={card.id}
              variant="outline"
              size="sm"
              onClick={() => quickAdd(card)}
              className="border-border hover:border-primary/50 hover:text-primary transition-colors"
            >
              {card.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
