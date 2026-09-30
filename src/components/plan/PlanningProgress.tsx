import type { PlanEvent } from '@/lib/pipeline/events';

const STEP_ORDER = [
  'candidates',
  'prices',
  'selection',
  'places',
  'itinerary',
] as const;
const STEP_LABELS: Record<(typeof STEP_ORDER)[number], string> = {
  candidates: 'Picking candidate destinations',
  prices: 'Checking flight and hotel prices',
  selection: 'Choosing the best fit',
  places: 'Finding places to eat and visit',
  itinerary: 'Building your day-by-day plan',
};

function isStepEvent(e: PlanEvent): e is Extract<PlanEvent, { type: 'step' }> {
  return e.type === 'step';
}

export default function PlanningProgress({ events }: { events: PlanEvent[] }) {
  const stepEvents = events.filter(isStepEvent);
  const completed = new Set(
    stepEvents.filter((e) => e.status === 'completed').map((e) => e.step),
  );
  const started = new Set(
    stepEvents.filter((e) => e.status === 'started').map((e) => e.step),
  );

  // "selection" is skipped by the pipeline when only one candidate fits the
  // budget (see planTrip.ts). It never gets a started/completed event for
  // that run, so treat "a later step has begun, but selection never did" as
  // skipped rather than leaving it looking permanently stuck at [ ].
  const selectionIndex = STEP_ORDER.indexOf('selection');
  const laterStepStarted = STEP_ORDER.slice(selectionIndex + 1).some(
    (s) => started.has(s) || completed.has(s),
  );
  const selectionSkipped =
    !completed.has('selection') &&
    !started.has('selection') &&
    laterStepStarted;

  const lastMessage: Partial<Record<(typeof STEP_ORDER)[number], string>> = {};
  for (const e of stepEvents) lastMessage[e.step] = e.message;

  return (
    <div>
      <h2>Planning your trip...</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {STEP_ORDER.map((step) => {
          const skipped = step === 'selection' && selectionSkipped;
          const done = completed.has(step);
          const active = !done && !skipped && started.has(step);

          const marker = done
            ? '[x] '
            : skipped
              ? '[-] '
              : active
                ? '[>] '
                : '[ ] ';

          return (
            <li
              key={step}
              style={{ marginBottom: 8, color: skipped ? '#aaa' : undefined }}
            >
              {marker}
              {STEP_LABELS[step]}
              {skipped && (
                <span> — skipped, only one destination fit your budget</span>
              )}
              {!skipped && (done || active) && lastMessage[step] && (
                <span style={{ color: '#888' }}> — {lastMessage[step]}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p>This usually takes under a minute.</p>
    </div>
  );
}
