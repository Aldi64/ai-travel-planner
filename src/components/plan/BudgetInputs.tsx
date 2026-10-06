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
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-ink/70">Budget</span>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="input-field text-sm py-1"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink/70">
          Flights
          <input
            className="input-field data-text"
            type="number"
            min={0}
            value={budgets.flightsBudget}
            onChange={(e) => set('flightsBudget', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink/70">
          Stay
          <input
            className="input-field data-text"
            type="number"
            min={0}
            value={budgets.stayBudget}
            onChange={(e) => set('stayBudget', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink/70">
          Food
          <input
            className="input-field data-text"
            type="number"
            min={0}
            value={budgets.foodBudget}
            onChange={(e) => set('foodBudget', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink/70">
          Activities
          <input
            className="input-field data-text"
            type="number"
            min={0}
            value={budgets.activitiesBudget}
            onChange={(e) => set('activitiesBudget', e.target.value)}
          />
        </label>
      </div>
      <p className="data-text text-sm text-ink/60 mt-2">
        Total: {total} {currency}
      </p>
    </div>
  );
}
