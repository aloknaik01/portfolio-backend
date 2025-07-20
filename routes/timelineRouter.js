import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addTimeline,
  deleteTimeline,
  getAllTimelines,
} from "../controllers/timelineControler.js";
const router = express.Router();

router.post("/add", isAuth, addTimeline);
router.delete("/delete/:id", isAuth, deleteTimeline);
router.get("/getall", getAllTimelines);

export default router;
