import express from "express";
const router = express.Router();
router.post("/promo/validate", async (req, res) => {
    const myCode = ["Flat10"];
    try {
        const { code } = await req.body;
        console.log({ code });
        console.log('first', myCode.includes(code));
        if (myCode.includes(code)) {
            return res
                .json({
                isValide: true,
                message: "You got off",
                ok: true,
                discount: 10
            })
                .status(200);
        }
        else {
            return res
                .json({
                isValide: false,
                message: "Oppps! Looks like code is invalide",
            })
                .status(400);
        }
    }
    catch (error) {
        console.log({ error });
        res
            .json({
            error: "server issue",
        })
            .status(500);
    }
});
export default router;
//# sourceMappingURL=isValidtProme.js.map