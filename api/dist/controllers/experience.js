import express from "express";
import { db } from "../lib/db.js";
const router = express.Router();
router.get("/experiences", async (req, res) => {
    try {
        const { name } = req.query; // <-- get ?name=
        const locations = await db.experience.findMany({
            where: {
                isActive: true,
                ...(name && {
                    name: {
                        contains: name,
                        mode: "insensitive",
                    },
                }),
            },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                city: true,
                state: true,
                imageUrl: true,
                price: true,
            },
        });
        res.json({
            success: true,
            data: locations,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch locations",
            error: error.message,
        });
    }
});
router.get("/experiences/:id", async (req, res) => {
    const experienceId = req.params.id;
    try {
        const locations = await db.experience.findUnique({
            where: { id: experienceId },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                city: true,
                state: true,
                imageUrl: true,
                price: true,
            },
        });
        res.json({
            success: true,
            data: locations,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch locations",
            error: error.message,
        });
    }
});
function getNext5Dates() {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }
    return dates;
}
router.get("/experiences/:id/availability", async (req, res) => {
    try {
        const experienceId = req.params.id;
        const dates = getNext5Dates();
        const location = await db.experience.findUnique({
            where: { id: experienceId },
        });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found",
            });
        }
        const existingSlots = await db.slot.findMany({
            where: {
                experienceId,
                date: {
                    in: dates,
                },
                isActive: true,
            },
        });
        const timeSlots = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];
        const availability = dates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const slots = timeSlots.map((timeSlot) => {
                const existingSlot = existingSlots.find((s) => s.date.toISOString().split("T")[0] === dateStr &&
                    s.timeSlot === timeSlot);
                return {
                    timeSlot,
                    slotId: existingSlot?.id || null,
                    totalCapacity: existingSlot?.totalCapacity || 5,
                    bookedCount: existingSlot?.bookedCount || 0,
                    availableSeats: existingSlot?.availableSeats || 5,
                    isAvailable: (existingSlot?.availableSeats || 20) > 0,
                    price: location.price,
                };
            });
            return {
                date: dateStr,
                dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
                slots,
            };
        });
        res.json({
            success: true,
            data: {
                location: {
                    id: location.id,
                    name: location.name,
                    price: location.price,
                },
                availability,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch availability",
            error: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=experience.js.map