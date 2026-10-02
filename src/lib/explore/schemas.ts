import { z } from 'zod';

const FoodItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10).max(300),
  area: z.string().min(1).max(100), // general neighborhood, NOT a precise street address
});
export const FoodRecommendationsResponseSchema = z.object({
  items: z.array(FoodItemSchema).min(4).max(8),
});
export type FoodItem = z.infer<typeof FoodItemSchema>;

const TransportOptionSchema = z.object({
  mode: z.string().min(1).max(60), // e.g. "Ride-hailing apps", "Public transit"
  description: z.string().min(10).max(300),
  tip: z.string().max(200).optional(),
});
export const TransportationResponseSchema = z.object({
  overview: z.string().min(10).max(400),
  options: z.array(TransportOptionSchema).min(2).max(6),
  generalTips: z.array(z.string().min(5).max(200)).min(1).max(5),
});
export type TransportationResponse = z.infer<
  typeof TransportationResponseSchema
>;
