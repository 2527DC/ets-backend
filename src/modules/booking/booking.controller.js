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
    const companyIdInt = parseInt(companyId, 10);
    if (isNaN(companyIdInt)) {
      return res.status(400).json({ error: "companyId must be a valid number." });
    }

    const bookings = await getBookingsByDateService({ companyId: companyIdInt, date });

    // Group bookings by shift and extract minimal necessary data
    const shiftBookingsMap = new Map();
    let totalBookings = 0;

    bookings.forEach(booking => {
      const shiftId = booking.shiftId;
      const shift = booking.shift;
      
      if (!shiftBookingsMap.has(shiftId)) {
        shiftBookingsMap.set(shiftId, {
          shiftId: shift.id,
          shiftType: shift.shiftType,
          shiftTime: `${String(shift.hour).padStart(2, '0')}:${String(shift.minute).padStart(2, '0')}`,
          totalBookings: 0,
          users: []
        });
      }

      const shiftData = shiftBookingsMap.get(shiftId);
      shiftData.totalBookings++;
      totalBookings++;

      // Add minimal user data necessary for routing
      shiftData.users.push({
        userId: booking.user.id,
        name: booking.user.name,
        phone: booking.user.phone,
        employeeId: booking.user.userId,
        address: booking.user.address,
        lat: booking.user.lat,
        lng: booking.user.lng,
        landmark: booking.user.landmark,
        bookingId: booking.id,
        bookingStatus: booking.status,
        emergencyContact: booking.user.additionalInfo?.emergencyContact,
        emergencyPhone: booking.user.additionalInfo?.emergencyPhone
      });
    });

    // Convert map to array and sort by shift time
    const shiftBookings = Array.from(shiftBookingsMap.values()).sort((a, b) => {
      const timeA = a.shiftTime.split(':').map(Number);
      const timeB = b.shiftTime.split(':').map(Number);
      return timeA[0] - timeB[0] || timeA[1] - timeB[1];
    });

    return res.status(200).json({
      message: "Scheduled bookings retrieved successfully",
      date,
      companyId: companyIdInt,
      totalBookings,
      totalShifts: shiftBookings.length,
      shiftBookings
    });
  } catch (error) {
    console.error("Error retrieving scheduled bookings:", error);
    return res.status(500).json({ error: error.message });
  }
};
