import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBookings = async ({ userId, companyId, shiftId, bookingType, isAdhoc, dates }) => {
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    throw new Error("Dates array is required.");
  }

  // Prepare booking records
  const bookingsData = dates.map(date => ({
    userId,
    companyId,
    shiftId,
    bookingType,
    isAdhoc: isAdhoc ?? false,
    scheduledTime: new Date(date), // ensure Date object
  }));

  // Bulk insert
  const bookings = await prisma.booking.createMany({
    data: bookingsData,
    skipDuplicates: true, // prevents duplicates (optional)
  });

  return bookings;
};



export const getBookingsByDateService = async ({ companyId, date }) => {
  const bookings = await prisma.booking.findMany({
    where: {
      companyId,
     
      scheduledTime: {
        equals: new Date(date), // this will only match exactly midnight times
      },
    },
    orderBy: {
      scheduledTime: "asc",
    },
    include: {
      user: true,
      shift: true,
 
      routeBookings:true
    },
  });

  return bookings;
};
