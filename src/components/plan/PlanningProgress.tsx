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
    <div className="bg-paper border border-ink/15 rounded-md p-6">
      <h2 className="text-lg text-ink mb-4">Planning your trip...</h2>
      {STEP_ORDER.map((step, i) => {
        const skipped = step === 'selection' && selectionSkipped;
        const done = completed.has(step);
        const active = !done && !skipped && started.has(step);

        return (
          <div key={step}>
            {i > 0 && <hr className="perforated-divider" />}
            <div className="flex items-center gap-3 py-1">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  done
                    ? 'bg-stamp'
                    : active
                      ? 'bg-gold'
                      : skipped
                        ? 'bg-ink/20'
                        : 'border border-ink/30'
                }`}
              />
              <div>
                <p
                  className={
                    skipped
                      ? 'text-ink/40'
                      : done || active
                        ? 'text-ink'
                        : 'text-ink/50'
                  }
                >
                  {STEP_LABELS[step]}
                </p>
                {skipped && (
                  <p className="text-sm text-ink/40">
                    Skipped — only one destination fit your budget
                  </p>
                )}
                {!skipped && (done || active) && lastMessage[step] && (
                  <p className="text-sm text-ink/50">{lastMessage[step]}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-sm text-ink/50 mt-4">
        This usually takes under a minute.
      </p>
    </div>
  );
}
