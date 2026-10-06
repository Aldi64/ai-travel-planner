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
      <div className="seg-group mb-4">
        {days.map((d) => (
          <button
            key={d.dayNumber}
            onClick={() => setActive(d.dayNumber)}
            data-active={active === d.dayNumber}
            className="seg-tab"
          >
            Day {d.dayNumber}
          </button>
        ))}
      </div>
      {activeDay?.items.map((item, i) => (
        <div key={item.id}>
          {i > 0 && <hr className="perforated-divider" />}
          <ItineraryItemRow item={item} />
        </div>
      ))}
    </div>
  );
}
