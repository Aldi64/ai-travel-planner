import { describe, it, expect, vi } from 'vitest';
import { planTrip } from '../src/lib/pipeline/planTrip';
import { fakeAiPlanner } from '../src/lib/ai/fake';
import { fakeFlightProvider } from '../src/lib/providers/flights/fake';
import { fakeHotelProvider } from '../src/lib/providers/hotels/fake';
import { fakePlaceProvider } from '../src/lib/places/fake';
import type { PlanInput } from '../src/lib/ai/types';
import type { PlanEvent } from '../src/lib/pipeline/events';

function makeFakeDb() {
  const calls: Record<string, unknown[]> = { tripUpdate: [], transaction: [] };
  return {
    calls,
    trip: {
      update: vi.fn(async (args: unknown) => {
        calls.tripUpdate.push(args);
        return {};
      }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        flight: { create: vi.fn(async () => ({})) },
        hotel: { create: vi.fn(async () => ({})) },
        itineraryDay: { create: vi.fn(async () => ({})) },
        trip: {
          update: vi.fn(async (args: unknown) => {
            calls.tripUpdate.push(args);
            return {};
          }),
        },
      };
      await fn(tx);
      calls.transaction.push(tx);
    }),
  };
}

const input: PlanInput = {
  originCode: 'CGK',
  originCity: 'Jakarta',
  startDate: '2026-12-12',
  endDate: '2026-12-17',
  numberOfDays: 5,
  groupSize: 2,
  tripStyles: ['adventure', 'cultural'],
  currency: 'USD',
  flightsBudget: 500,
  stayBudget: 600,
  foodBudget: 250,
  activitiesBudget: 200,
};

describe('planTrip (fake deps end-to-end)', () => {
  it('completes the full pipeline and emits done', async () => {
    const fakeDb = makeFakeDb();
    const events: PlanEvent[] = [];

    await planTrip('trip-1', input, (e) => events.push(e), {
      ai: fakeAiPlanner,
      flights: fakeFlightProvider,
      hotels: fakeHotelProvider,
      places: fakePlaceProvider,
      db: fakeDb as never,
    });

    expect(events.some((e) => e.type === 'done')).toBe(true);
    expect(events.some((e) => e.type === 'error')).toBe(false);
    expect(fakeDb.calls.transaction).toHaveLength(1);

    const finalUpdate = fakeDb.calls.tripUpdate.at(-1) as {
      data: { status: string };
    };
    expect(finalUpdate.data.status).toBe('COMPLETED');
  });

  it('fails cleanly when the budget is impossibly low', async () => {
    const fakeDb = makeFakeDb();
    const events: PlanEvent[] = [];
    const tinyBudgetInput: PlanInput = {
      ...input,
      flightsBudget: 1,
      stayBudget: 1,
    };

    await planTrip('trip-2', tinyBudgetInput, (e) => events.push(e), {
      ai: fakeAiPlanner,
      flights: fakeFlightProvider,
      hotels: fakeHotelProvider,
      places: fakePlaceProvider,
      db: fakeDb as never,
    });

    expect(events.some((e) => e.type === 'error')).toBe(true);
    expect(fakeDb.calls.transaction).toHaveLength(0);

    const finalUpdate = fakeDb.calls.tripUpdate.at(-1) as {
      data: { status: string; failureReason: string };
    };
    expect(finalUpdate.data.status).toBe('FAILED');
    expect(finalUpdate.data.failureReason).toBe('NO_FIT');
  });
});
