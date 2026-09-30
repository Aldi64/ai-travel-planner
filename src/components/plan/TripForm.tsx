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
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h1>Plan a new trip</h1>
      <AirportCombobox value={origin} onChange={setOrigin} />
      <div style={{ display: 'flex', gap: 8 }}>
        <label>
          Start{' '}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End{' '}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Travelers{' '}
          <input
            type="number"
            min={1}
            max={20}
            value={groupSize}
            onChange={(e) => setGroupSize(Number(e.target.value) || 1)}
          />
        </label>
      </div>
      <div>
        <p>Trip style (pick up to 3)</p>
        <StyleChips value={styles} onChange={setStyles} />
      </div>
      <BudgetInputs
        budgets={budgets}
        currency={currency}
        onBudgetsChange={setBudgets}
        onCurrencyChange={setCurrency}
      />
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
      <button type="submit">Find my trip</button>
    </form>
  );
}
