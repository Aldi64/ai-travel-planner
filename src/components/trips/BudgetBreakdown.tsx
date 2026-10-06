import { Wallet, Plane, BedDouble, Utensils, Ticket } from 'lucide-react';

interface BudgetBreakdownProps {
  trip: {
    flightsBudget: number;
    stayBudget: number;
    foodBudget: number;
    activitiesBudget: number;
    totalEstimatedCost: number | null;
    currency: string;
    selectedFlight: { price: number } | null;
    selectedHotel: { totalPrice: number } | null;
    itineraryDays: { items: { type: string; estimatedCost: number }[] }[];
  };
}

const ROW_ICONS = {
  Flights: Plane,
  Stay: BedDouble,
  Food: Utensils,
  Activities: Ticket,
} as const;

export default function BudgetBreakdown({ trip }: BudgetBreakdownProps) {
  const flightsSpent = trip.selectedFlight?.price ?? 0;
  const staySpent = trip.selectedHotel?.totalPrice ?? 0;
  const allItems = trip.itineraryDays.flatMap((d) => d.items);
  const foodSpent = allItems
    .filter((i) => i.type === 'FOOD')
    .reduce((s, i) => s + i.estimatedCost, 0);
  const activitiesSpent = allItems
    .filter((i) => i.type === 'ACTIVITY')
    .reduce((s, i) => s + i.estimatedCost, 0);

  const rows = [
    {
      label: 'Flights' as const,
      spent: flightsSpent,
      budget: trip.flightsBudget,
    },
    { label: 'Stay' as const, spent: staySpent, budget: trip.stayBudget },
    { label: 'Food' as const, spent: foodSpent, budget: trip.foodBudget },
    {
      label: 'Activities' as const,
      spent: activitiesSpent,
      budget: trip.activitiesBudget,
    },
  ];
  const totalBudget =
    trip.flightsBudget +
    trip.stayBudget +
    trip.foodBudget +
    trip.activitiesBudget;

  return (
    <div className="bg-paper border border-ink/15 rounded-md p-5 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-gold" />
          <h3 className="text-lg text-ink font-semibold">Budget</h3>
        </div>
        {trip.totalEstimatedCost != null && (
          <span className="text-sm text-ink/70">
            Total spent{' '}
            <span className="data-text font-semibold text-ink">
              {Math.round(trip.totalEstimatedCost)} / {totalBudget}{' '}
              {trip.currency}
            </span>
          </span>
        )}
      </div>

      {rows.map((r, i) => {
        const over = r.spent > r.budget;
        const pct = Math.min(100, (r.spent / r.budget) * 100);
        const Icon = ROW_ICONS[r.label];
        return (
          <div key={r.label}>
            {i > 0 && <hr className="perforated-divider" />}
            <div className="flex items-center gap-3 py-1">
              <Icon size={16} className="text-ink/50 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink">{r.label}</span>
                  <span className="data-text text-ink/80">
                    {Math.round(r.spent)} / {r.budget} {trip.currency}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${over ? 'bg-airmail' : 'bg-stamp'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-xs font-medium shrink-0 flex items-center gap-1 ${
                  over ? 'text-airmail' : 'text-stamp'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${over ? 'bg-airmail' : 'bg-stamp'}`}
                />
                {over ? 'Over budget' : 'On track'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
