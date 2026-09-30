import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateTripSchema, toPlanInput } from '@/lib/validation/tripInput';
import { checkRateLimit } from '@/lib/rateLimit';
import { planTrip } from '@/lib/pipeline/planTrip';
import { realDeps } from '@/lib/pipeline/deps';
import type { PlanEvent } from '@/lib/pipeline/events';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rate = checkRateLimit(session.user.id);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          "You've reached today's trip-planning limit. Try again tomorrow.",
      },
      { status: 429 },
    );
  }

  const parsed = CreateTripSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;
  const planInput = toPlanInput(body);

  const trip = await db.trip.create({
    data: {
      userId: session.user.id,
      origin: body.originCity,
      originCode: body.originCode,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      groupSize: body.groupSize,
      tripStyles: body.tripStyles,
      currency: body.currency,
      flightsBudget: body.flightsBudget,
      stayBudget: body.stayBudget,
      foodBudget: body.foodBudget,
      activitiesBudget: body.activitiesBudget,
      status: 'PLANNING',
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: PlanEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      };
      try {
        await planTrip(trip.id, planInput, emit, realDeps);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    },
  });
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const trips = await db.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      origin: true,
      destinationCity: true,
      destinationCountry: true,
      startDate: true,
      endDate: true,
      status: true,
      totalEstimatedCost: true,
      currency: true,
    },
  });

  return NextResponse.json({ trips });
}
