import { MapPin } from 'lucide-react';

interface ItineraryItemRowProps {
  item: {
    type: string;
    name: string;
    description: string | null;
    startTime: string | null;
    estimatedCost: number;
  };
}

export default function ItineraryItemRow({ item }: ItineraryItemRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="data-text text-sm text-ink/60 w-14 shrink-0 mt-0.5">
        {item.startTime}
      </span>
      <span
        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.type === 'FOOD' ? 'bg-gold' : 'bg-stamp'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-ink font-medium">{item.name}</div>
        {item.description && (
          <div className="text-sm text-ink/60 mt-0.5">{item.description}</div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-ink/50 shrink-0 w-36">
        <MapPin size={12} />
        {/* The reference image showed a separate location label -- our
            ItineraryItem has no distinct location field, so this reuses
            the item's own name rather than inventing a second one. */}
        <span className="truncate">{item.name}</span>
      </div>
      <span className="data-text text-sm text-ink/80 w-10 text-right shrink-0">
        {item.estimatedCost > 0 ? item.estimatedCost : '—'}
      </span>
    </div>
  );
}
