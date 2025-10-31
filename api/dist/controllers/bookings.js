import { Router } from "express";
import { db } from "../lib/db.js";
const router = Router();
router.post("/bookings", async (req, res) => {
    try {
        const { userMail, slotId, numberOfSeats = 1, userName, } = req.body;
        // Validation
        if (!userMail || !slotId || !userName) {
            return res.status(400).json({
                success: false,
                message: "userMail, slotId and userName are required",
            });
        }
        // Get slot with experience
        const slot = await db.slot.findUnique({
            where: { id: slotId },
            include: { experience: true },
        });
        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Slot not found",
            });
        }
        if (slot.availableSeats < numberOfSeats) {
            return res.status(400).json({
                success: false,
                message: `Only ${slot.availableSeats} seats available`,
            });
        }
        // Calculate amount
        let subtotal = slot.experience.price * numberOfSeats;
        const finalSubtotal = Math.max(0, subtotal);
        const taxes = Math.floor((5 / 100) * finalSubtotal);
        const totalAmount = Math.round(finalSubtotal + taxes);
        const booking = await db.booking.create({
            data: {
                slotId,
                totalAmount: totalAmount,
                numberOfSeats: numberOfSeats,
                userMail,
                userName,
                status: "CONFIRMED",
            },
        });
        await db.slot.update({
            where: { id: slotId },
            data: {
                bookedCount: { increment: booking.numberOfSeats },
                availableSeats: { decrement: booking.numberOfSeats },
            },
        });
        res.status(200).json({
            success: true,
            ok: true,
            bookingId: booking.id,
        });
    }
    catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Stripe payment failed",
        });
    }
});
router.delete("/bookings/:bookingId", async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const result = await db.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
            });
            if (!booking) {
                throw new Error("Booking not found");
            }
            if (booking.status === "CANCELLED") {
                throw new Error("Booking already cancelled");
            }
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" },
            });
            await tx.slot.update({
                where: { id: booking.slotId },
                data: {
                    bookedCount: { decrement: booking.numberOfSeats },
                    availableSeats: { increment: booking.numberOfSeats },
                },
            });
            return updatedBooking;
        });
        res.json({
            success: true,
            message: "Booking cancelled successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to cancel booking",
        });
    }
});
export default router;
//# sourceMappingURL=bookings.js.map