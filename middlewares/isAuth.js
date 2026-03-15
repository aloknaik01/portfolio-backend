import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import jwt from "jsonwebtoken";

export const isAuth = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("User Not Authenticated!", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const { rows } = await query('SELECT id, email, "fullName" FROM "User" WHERE id = $1', [decoded.id]);
  const user = rows[0];

  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  req.user = user;
  next();
});
