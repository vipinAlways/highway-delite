import type { Router, Request, Response } from "express";
import express from "express";

const router: Router = express.Router();

router.post("/promo/validate", async (req: Request, res: Response) => {
  const myCode: string[] = ["Flat10"];
  try {
    const { code } = await req.body;
    console.log({code});
    console.log('first', myCode.includes(code))
    if (myCode.includes(code)) {
      return res
        .json({
          isValide: true,
          message: "You got off",
          ok:true,
          discount:10
        })
        .status(200);
    } else {
      return res
        .json({
          isValide: false,
          message: "Oppps! Looks like code is invalide",
        })
        .status(400);
    }
  } catch (error) {
    console.log({ error });
    res
      .json({
        error: "server issue",
      })
      .status(500);
  }
});

export default router;
