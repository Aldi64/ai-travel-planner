import { z } from 'zod';

export const CreateTripSchema = z
  .object({
    originCode: z.string().length(3).toUpperCase(),
    originCity: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    groupSize: z.number().int().min(1).max(20),
    tripStyles: z.array(z.string().min(1)).min(1).max(3),
    currency: z.string().length(3).toUpperCase(),
    flightsBudget: z.number().positive(),
    stayBudget: z.number().positive(),
    foodBudget: z.number().positive(),
    activitiesBudget: z.number().positive(),
  })
  .refine((v) => new Date(v.startDate) > new Date(), {
    message: 'startDate must be in the future',
    path: ['startDate'],
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  })
  .refine(
    (v) =>
      (new Date(v.endDate).getTime() - new Date(v.startDate).getTime()) /
        86400000 <=
      30,
    {
      message: 'trips longer than 30 days are not supported',
      path: ['endDate'],
    },
  );

export type CreateTripInput = z.infer<typeof CreateTripSchema>;

export function toPlanInput(body: CreateTripInput) {
  const numberOfDays =
    Math.round(
      (new Date(body.endDate).getTime() - new Date(body.startDate).getTime()) /
        86400000,
    ) + 1;
  return { ...body, numberOfDays };
}
