import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// ADD APPLICATION
export const addApplication = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, level, description } = req.body;

    if (!name) {
      return next(new ErrorHandler("Application name is required!", 400));
    }

    let svgPublicId = "";
    let svgUrl = "";

    if (req.files && req.files.svg) {
      const { svg } = req.files;
      const cloudiRes = await cloudinary.uploader.upload(svg.tempFilePath, {
        folder: "APPS",
      });

      if (!cloudiRes || cloudiRes.error) {
        return next(new ErrorHandler("Cloudinary Error for Application Icon", 500));
      }
      svgPublicId = cloudiRes.public_id;
      svgUrl = cloudiRes.secure_url;
    } else if (req.body.svg) {
      svgUrl = req.body.svg;
    } else {
      return next(new ErrorHandler("Application Icon (file or URL) is Required!", 400));
    }

    const id = crypto.randomUUID();
    const sql = `
      INSERT INTO "Application" (id, name, level, description, "svgPublicId", "svgUrl", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [id, name, level || 'Development', description || 'Software application and development tool.', svgPublicId, svgUrl];

    const { rows } = await query(sql, values);
    const app = rows[0];

    res.status(200).json({ success: true, message: "Application added", app });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to add application", 500));
  }
});

// UPDATE APPLICATION
export const updateApplication = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, level, description } = req.body;

    const { rows } = await query('SELECT * FROM "Application" WHERE id = $1', [id]);
    const application = rows[0];

    if (!application) {
      return next(new ErrorHandler("Application Not found", 404));
    }

    let svgPublicId = application.svgPublicId;
    let svgUrl = application.svgUrl;

    if (req.files && req.files.svg) {
      // Delete old icon if exists
      if (svgPublicId) {
        await cloudinary.uploader.destroy(svgPublicId);
      }
      const { svg } = req.files;
      const cloudiRes = await cloudinary.uploader.upload(svg.tempFilePath, {
        folder: "APPS",
      });

      if (!cloudiRes || cloudiRes.error) {
        return next(new ErrorHandler("Cloudinary Error for Application Icon Update", 500));
      }
      svgPublicId = cloudiRes.public_id;
      svgUrl = cloudiRes.secure_url;
    }

    const sql = `
      UPDATE "Application"
      SET name = $1, level = $2, description = $3, "svgPublicId" = $4, "svgUrl" = $5, "updatedAt" = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const values = [
      name || application.name,
      level !== undefined ? level : application.level,
      description !== undefined ? description : application.description,
      svgPublicId,
      svgUrl,
      id
    ];

    const { rows: updatedRows } = await query(sql, values);
    const updatedApp = updatedRows[0];

    res.status(200).json({ success: true, message: "Application Updated", app: updatedApp });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to update application", 500));
  }
});

// DELETE APPLICATION
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT "svgPublicId" FROM "Application" WHERE id = $1', [id]);
    const application = rows[0];

    if (!application) {
      return next(new ErrorHandler("Application Not found", 404));
    }

    if (application.svgPublicId) {
      await cloudinary.uploader.destroy(application.svgPublicId);
    }
    await query('DELETE FROM "Application" WHERE id = $1', [id]);

    res.status(200).json({ success: true, message: "Application Deleted" });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to delete application", 500));
  }
});

// GET ALL APPLICATIONS
export const getallApplication = catchAsyncErrors(async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM "Application" ORDER BY "createdAt" DESC');
    const allApp = rows || [];

    res.status(200).json({ success: true, allApp });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to fetch applications", 500));
  }
});
