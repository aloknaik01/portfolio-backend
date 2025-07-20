import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addSkill,
  deleteSkill,
  getAllSkill,
  updateSkill
} from "../controllers/skillController.js";

const router = express.Router();

router.post("/add", isAuth, addSkill);
router.put("/update/:id", isAuth, updateSkill);
router.delete("/delete/:id", isAuth, deleteSkill);
router.get("/getall", getAllSkill);

export default router;
