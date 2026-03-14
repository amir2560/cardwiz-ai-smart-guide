import { getBankGradient, CreditCard as CardType } from '@/lib/data';
import { CreditCard as CardIcon } from 'lucide-react';

interface Props {
  card: CardType;
  onClick?: () => void;
  highlight?: boolean;
}

export default function CreditCardUI({ card, onClick, highlight }: Props) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 aspect-[1.6/1] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${getBankGradient(card.bank)} ${
        highlight ? 'gold-glow ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium opacity-80 text-foreground">{card.bank}</p>
          <p className="text-lg font-display font-bold text-foreground">{card.name}</p>
        </div>
        <CardIcon className="h-8 w-8 opacity-40 text-foreground" />
      </div>

      <div>
        <p className="text-sm font-mono tracking-widest opacity-60 text-foreground mb-3">
          •••• •••• •••• {Math.floor(1000 + Math.random() * 9000)}
        </p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(card.rewards)
            .filter(([, v]) => v >= 3)
            .map(([cat, pct]) => (
              <span
                key={cat}
                className="text-[10px] font-semibold bg-foreground/20 text-foreground rounded-full px-2 py-0.5"
              >
                {cat} {pct}%
              </span>
            ))}
        </div>
      </div>

      {/* decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-foreground/5" />
      <div className="absolute -right-4 top-8 h-20 w-20 rounded-full bg-foreground/5" />
    </div>
  );
}
