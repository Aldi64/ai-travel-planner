import { z } from 'zod';

export const SavePlaceSchema = z.object({
  category: z.enum(['TOURIST_AREA', 'LANDMARK', 'NATURE', 'FOOD']), // TRANSPORTATION isn't bookmarkable
  source: z.enum(['geoapify', 'ai']),
  externalId: z.string().nullable().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).nullable().optional(),
  address: z.string().max(300).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  city: z.string().min(1).max(100),
});
