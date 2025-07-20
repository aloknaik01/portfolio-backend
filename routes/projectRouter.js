import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addProject,
  deleteProject,
  getallProjects,
  updateProject,
  getOneProject,
} from "../controllers/projectController.js";

const router = express.Router();
router.post("/add", isAuth, addProject);
router.delete("/delete/:id", isAuth, deleteProject);
router.get("/getall", getallProjects);
router.get("/getone/:id", getOneProject);
router.put("/update/:id", updateProject);

export default router;
