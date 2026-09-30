const CURRENCIES = ['USD', 'EUR', 'GBP', 'IDR', 'SGD'];

export interface Budgets {
  flightsBudget: number;
  stayBudget: number;
  foodBudget: number;
  activitiesBudget: number;
}

export default function BudgetInputs({
  budgets,
  currency,
  onBudgetsChange,
  onCurrencyChange,
}: {
  budgets: Budgets;
  currency: string;
  onBudgetsChange: (b: Budgets) => void;
  onCurrencyChange: (c: string) => void;
}) {
  function set(key: keyof Budgets, v: string) {
    onBudgetsChange({ ...budgets, [key]: Number(v) || 0 });
  }
  const total =
    budgets.flightsBudget +
    budgets.stayBudget +
    budgets.foodBudget +
    budgets.activitiesBudget;

  return (
    <div>
      <label>
        Currency{' '}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginTop: 8,
        }}
      >
        <label>
          Flights{' '}
          <input
            type="number"
            min={0}
            value={budgets.flightsBudget}
            onChange={(e) => set('flightsBudget', e.target.value)}
          />
        </label>
        <label>
          Stay{' '}
          <input
            type="number"
            min={0}
            value={budgets.stayBudget}
            onChange={(e) => set('stayBudget', e.target.value)}
          />
        </label>
        <label>
          Food{' '}
          <input
            type="number"
            min={0}
            value={budgets.foodBudget}
            onChange={(e) => set('foodBudget', e.target.value)}
          />
        </label>
        <label>
          Activities{' '}
          <input
            type="number"
            min={0}
            value={budgets.activitiesBudget}
            onChange={(e) => set('activitiesBudget', e.target.value)}
          />
        </label>
      </div>
      <p>
        Total: {total} {currency}
      </p>
    </div>
  );
}
