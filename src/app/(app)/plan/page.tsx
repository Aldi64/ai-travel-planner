'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TripForm from '@/components/plan/TripForm';
import PlanningProgress from '@/components/plan/PlanningProgress';
import type { PlanEvent } from '@/lib/pipeline/events';

export default function PlanPage() {
  const router = useRouter();
  const [events, setEvents] = useState<PlanEvent[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: unknown) {
    setSubmitting(true);
    setEvents([]);
    setError(null);

    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const fieldErrors = body.error?.fieldErrors ?? {};
      const firstError = Object.values(fieldErrors).flat()[0];
      setError(
        typeof firstError === 'string'
          ? firstError
          : (body.error ?? `Request failed (${res.status})`),
      );
      setSubmitting(false);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const event: PlanEvent = JSON.parse(line);
        setEvents((prev) => [...prev, event]);

        if (event.type === 'done') {
          router.push(`/trips/${event.tripId}`);
          return;
        }
        if (event.type === 'error') {
          setError(event.message);
          setSubmitting(false);
        }
      }
    }
  }

  function reset() {
    setError(null);
    setEvents([]);
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4 pb-16">
      {!submitting && events.length === 0 && (
        <TripForm onSubmit={handleSubmit} />
      )}
      {submitting && <PlanningProgress events={events} />}
      {error && <p className="text-sm text-airmail mt-3">{error}</p>}
      {error && !submitting && (
        <button onClick={reset} className="btn-secondary mt-2">
          Try again
        </button>
      )}
    </div>
  );
}
