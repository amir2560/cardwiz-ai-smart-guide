interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: boolean;
}

export default function StatCard({ title, value, subtitle, icon, accent }: Props) {
  return (
    <div className={`glass-card p-5 flex flex-col gap-3 animate-fade-in ${accent ? 'gold-glow border-primary/30' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-display font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
