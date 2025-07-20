import express from "express";
import {
  addApplication,
  deleteApplication,
  getallApplication,
} from "../controllers/appController.js";

import { isAuth } from "../middlewares/isAuth.js";
const router = express.Router();

router.post("/add", isAuth, addApplication);
router.delete("/delete/:id", isAuth, deleteApplication);
router.get("/getall", getallApplication);

export default router;
