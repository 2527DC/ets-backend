import { z } from "zod";
import { BookingType, BookingStatus } from "@prisma/client"; // ✅ Import enums from Prisma

// Convert Prisma enums into Zod enums
export const BookingTypeEnum = z.nativeEnum(BookingType);
export const BookingStatusEnum = z.nativeEnum(BookingStatus);

export const createBookingSchema = z.object({
  userId: z.number({
    required_error: "userId is required",
    invalid_type_error: "userId must be a number"
  }),

  companyId: z.number({
    required_error: "companyId is required",
    invalid_type_error: "companyId must be a number"
  }),

  shiftId: z.number({
    required_error: "shiftId is required",
    invalid_type_error: "shiftId must be a number"
  }),

  bookingType: BookingTypeEnum, // ✅ Uses Prisma enum

  isAdhoc: z.boolean().optional().default(false),

  // ✅ Array of plain dates (YYYY-MM-DD)
  dates: z.array(
    z.preprocess((val) => {
      if (typeof val === "string") {
        // Append `T00:00:00Z` → normalized ISO Date
        const parsed = new Date(val + "T00:00:00Z");
        if (!isNaN(parsed.getTime())) return parsed;
      }
      return val;
    }, z.date({
      invalid_type_error: "Each date must be a valid string in YYYY-MM-DD format"
    }))
  ).min(1, { message: "At least one scheduled date is required" })
});
