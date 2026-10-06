'use client';

import { useState } from 'react';
import AirportCombobox from './AirportCombobox';
import StyleChips from './StyleChips';
import BudgetInputs, { type Budgets } from './BudgetInputs';

export default function TripForm({
  onSubmit,
}: {
  onSubmit: (payload: unknown) => void;
}) {
  const [origin, setOrigin] = useState<{ code: string; city: string } | null>(
    null,
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [styles, setStyles] = useState<string[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [budgets, setBudgets] = useState<Budgets>({
    flightsBudget: 0,
    stayBudget: 0,
    foodBudget: 0,
    activitiesBudget: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin) return setFormError('Pick a departure airport.');
    if (!startDate || !endDate) return setFormError('Pick your travel dates.');
    if (styles.length === 0)
      return setFormError('Pick at least one trip style.');
    if (Object.values(budgets).some((b) => b <= 0))
      return setFormError('Enter a budget greater than 0 for each category.');
    setFormError(null);

    onSubmit({
      originCode: origin.code,
      originCity: origin.city,
      startDate,
      endDate,
      groupSize,
      tripStyles: styles,
      currency,
      ...budgets,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper border border-ink/15 rounded-md p-6 flex flex-col gap-5"
    >
      <div>
        <h1 className="text-2xl text-ink">Plan a new trip</h1>
        <p className="text-ink/60 text-sm mt-1">
          Tell us your budget. We&apos;ll pick the destination.
        </p>
      </div>

      <AirportCombobox value={origin} onChange={setOrigin} />

      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink/70 flex-1">
          Start
          <input
            className="input-field"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink/70 flex-1">
          End
          <input
            className="input-field"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink/70 w-24">
          Travelers
          <input
            className="input-field"
            type="number"
            min={1}
            max={20}
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value) || 1)}
          />
        </label>
      </div>

      <div>
        <p className="text-sm text-ink/70 mb-2">Trip style (pick up to 3)</p>
        <StyleChips value={styles} onChange={setStyles} />
      </div>

      <BudgetInputs
        budgets={budgets}
        currency={currency}
        onBudgetsChange={setBudgets}
        onCurrencyChange={setCurrency}
      />

      {formError && <p className="text-sm text-airmail">{formError}</p>}

      <button type="submit" className="btn-primary">
        Find my trip
      </button>
    </form>
  );
}
