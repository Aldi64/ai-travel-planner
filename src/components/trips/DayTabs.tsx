'use client';

import { useState } from 'react';
import ItineraryItemRow from './ItineraryItemRow';

interface DayTabsProps {
  days: {
    dayNumber: number;
    items: {
      id: string;
      type: string;
      name: string;
      description: string | null;
      startTime: string | null;
      estimatedCost: number;
    }[];
  }[];
}

export default function DayTabs({ days }: DayTabsProps) {
  const [active, setActive] = useState(days[0]?.dayNumber ?? 1);
  const activeDay = days.find((d) => d.dayNumber === active);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {days.map((d) => (
          <button
            key={d.dayNumber}
            onClick={() => setActive(d.dayNumber)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              border:
                active === d.dayNumber ? '2px solid #333' : '1px solid #ccc',
              background: active === d.dayNumber ? '#eee' : 'white',
            }}
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>
      {activeDay?.items.map((item) => (
        <ItineraryItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
