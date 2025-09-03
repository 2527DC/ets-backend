import { createBookings } from "./booking.service.js";

export const createBookingsController = async (req, res) => {
  try {
    const { userId, companyId, shiftId, bookingType, isAdhoc, dates } = req.body;

    if (!userId || !companyId || !bookingType) {
      return res.status(400).json({ error: "userId, companyId and bookingType are required." });
    }

    const result = await createBookings({
      userId,
      companyId,
      shiftId,
      bookingType,
      isAdhoc,
      dates,
    });

    return res.status(201).json({
      message: "Bookings created successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error creating bookings:", error);
    return res.status(500).json({ error: error.message });
  }
};
