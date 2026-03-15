import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import crypto from "crypto";

// ADD TIMELINE
export const addTimeline = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;

  if (!title || !description) {
    return next(new ErrorHandler("Title and Description are Required!", 400));
  }

  if (!from) {
    return next(new ErrorHandler("Joining Date is required!", 400));
  }

  const id = crypto.randomUUID();
  const sql = `
    INSERT INTO "Timeline" (id, title, description, "from", "to", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;
  const values = [id, title, description, from, to];

  const { rows } = await query(sql, values);
  const newTimeline = rows[0];

  res.status(200).json({ success: true, message: "Timeline Added", newTimeline });
});

// DELETE TIMELINE
export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { rowCount } = await query('DELETE FROM "Timeline" WHERE id = $1', [id]);

  if (rowCount === 0) {
    return next(new ErrorHandler("TimeLine not Found!", 404));
  }

  res.status(200).json({ success: true, message: "Timeline Deleted!" });
});

// GET ALL TIMELINES
export const getAllTimelines = catchAsyncErrors(async (req, res, next) => {
  const { rows } = await query('SELECT * FROM "Timeline" ORDER BY "from" ASC');
  const allTimeline = rows || [];

  res.status(200).json({ success: true, allTimeline });
});
