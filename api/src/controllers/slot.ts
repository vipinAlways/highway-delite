import express from "express";
import type { Router, Request, Response } from "express";
import { db } from "../lib/db.js";


const router: Router = express.Router();

router.post("/slots/get-or-create", async (req: Request, res: Response) => {
  try {
    const { experienceId, date, timeSlot } = req.body;

    if (!experienceId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "locationId, date, and timeSlot are required",
      });
    }

    let slot = await db.slot.findFirst({
      where: {
        experienceId: experienceId,
        date: new Date(date),
        timeSlot,
        isActive: true,
      },
    });

    if (!slot) {
      slot = await db.slot.create({
        data: {
          experienceId: experienceId,
          date: new Date(date),
          timeSlot,
          totalCapacity: 5,
          bookedCount: 0,
          availableSeats: 5,
        },
      });
    }

    res.json({
      success: true,
      data: slot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get or create slot",
      error,
    });
  }
});



export default router;
