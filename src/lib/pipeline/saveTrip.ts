import type { PrismaClient } from "../../generated/prisma/client";
import type { FlightOffer, HotelOffer } from "../providers/types";
import type { ItineraryResponse } from "../ai/schemas";
import type { PlanInput } from "../ai/types";

function addDays(dateStr: string, days: number): Date {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function saveCompletedTrip(
  db: PrismaClient,
  tripId: string,
  destination: { city: string; country: string },
  flightOffer: FlightOffer,
  hotelOffer: HotelOffer,
  itinerary: ItineraryResponse,
  input: PlanInput
): Promise<void> {
  const activitiesTotal = itinerary.days
    .flatMap((d) => d.items)
    .filter((i) => i.type === "ACTIVITY")
    .reduce((sum, i) => sum + i.estimatedCost, 0);
  const foodTotal = itinerary.days
    .flatMap((d) => d.items)
    .filter((i) => i.type === "FOOD")
    .reduce((sum, i) => sum + i.estimatedCost, 0);
  const totalEstimatedCost = flightOffer.price + hotelOffer.totalPrice + activitiesTotal + foodTotal;

  await db.$transaction(async (tx) => {
    await tx.flight.create({
      data: {
        tripId,
        carrier: flightOffer.carrier,
        price: flightOffer.price,
        departTime: new Date(flightOffer.departTime),
        arriveTime: new Date(flightOffer.arriveTime),
        bookingRef: flightOffer.bookingRef,
      },
    });

    await tx.hotel.create({
      data: {
        tripId,
        name: hotelOffer.name,
        pricePerNight: hotelOffer.pricePerNight,
        totalPrice: hotelOffer.totalPrice,
        rating: hotelOffer.rating,
        address: hotelOffer.address,
      },
    });

    for (const day of itinerary.days) {
      await tx.itineraryDay.create({
        data: {
          tripId,
          dayNumber: day.dayNumber,
          date: addDays(input.startDate, day.dayNumber - 1),
          items: {
            create: day.items.map((i) => ({
              type: i.type,
              name: i.name,
              description: i.description,
              startTime: i.startTime,
              estimatedCost: i.estimatedCost,
              placeId: i.placeId,
            })),
          },
        },
      });
    }

    await tx.trip.update({
      where: { id: tripId },
      data: {
        destinationCity: destination.city,
        destinationCountry: destination.country,
        status: "COMPLETED",
        totalEstimatedCost,
      },
    });
  });
}