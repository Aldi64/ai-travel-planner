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
    { label: 'Flights', spent: flightsSpent, budget: trip.flightsBudget },
    { label: 'Stay', spent: staySpent, budget: trip.stayBudget },
    { label: 'Food', spent: foodSpent, budget: trip.foodBudget },
    {
      label: 'Activities',
      spent: activitiesSpent,
      budget: trip.activitiesBudget,
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Budget</h3>
      {rows.map((r) => (
        <div key={r.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{r.label}</span>
            <span>
              {Math.round(r.spent)} / {r.budget} {trip.currency}
            </span>
          </div>
          <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
            <div
              style={{
                width: `${Math.min(100, (r.spent / r.budget) * 100)}%`,
                background: r.spent > r.budget ? '#e33' : '#3a3',
                height: 8,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
      {trip.totalEstimatedCost != null && (
        <p style={{ marginTop: 8 }}>
          <strong>
            Total: {Math.round(trip.totalEstimatedCost)} {trip.currency}
          </strong>
        </p>
      )}
    </div>
  );
}
