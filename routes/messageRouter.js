import express from "express";
import {
  getallMessage,
  sendMessage,
  deleteMessage,
  getMessageById,
} from "../controllers/messageControler.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", isAuth, getallMessage);
router.delete("/delete/:id", isAuth, deleteMessage);
router.get("/getone/:id", isAuth, getMessageById);

export default router;
