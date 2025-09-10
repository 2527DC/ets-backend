import { createBookings, getBookingsByDateService } from "./booking.service.js";

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



export const getScheduledBookingsController = async (req, res) => {
  try {
    const { date, companyId } = req.query;

    if (!date || !companyId) {
      return res.status(400).json({ error: "date and companyId are required." });
    }

    // Convert companyId to integer
    const companyIdInt = parseInt(companyId , 10);
    if (isNaN(companyIdInt)) {
      return res.status(400).json({ error: "companyId must be a valid number." });
    }

    const bookings = await getBookingsByDateService({ companyId: companyIdInt, date });

    return res.status(200).json({
      message: "Scheduled bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    console.error("Error retrieving scheduled bookings:", error);
    return res.status(500).json({ error: error.message });
  }
};
