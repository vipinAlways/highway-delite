import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import experience from "./controllers/experience.js";
import bookings from "./controllers/bookings.js";
import slots from "./controllers/slot.js";
import promocheck from "./controllers/isValidtProme.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "./.env") });
const app = express();

const PORT = process.env.PORT ?? 8000;

app.use(
  cors({
    origin: [
      "https://highway-delite-lovat.vercel.app/"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>Vipin Always Server</h1>");
});

app.use("/", experience);
app.use("/", bookings);
app.use("/", slots);
app.use("/",promocheck );

app.listen(PORT, () => {
  console.log("server running on", { PORT });
});
