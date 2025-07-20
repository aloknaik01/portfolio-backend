import express from "express";
import {
  login,
  register,
  logout,
  getUser,
  updateProfile,
  updatePassword,
  getUserForPortfolio,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuth, logout);
router.get("/getme", isAuth, getUser);
router.put("/update/me", isAuth, updateProfile);
router.put("/update/password", isAuth, updatePassword);
router.get("/me/portfolio", getUserForPortfolio);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
