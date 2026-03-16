import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// ADD SKILL
export const addSkill = catchAsyncErrors(async (req, res, next) => {
  try {
    const { title, proficiency, category } = req.body;

    if (!title || !proficiency) {
      return next(new ErrorHandler("Title and Proficiency are Required!", 400));
    }

    let svgPublicId = "";
    let svgUrl = "";

    if (req.files && req.files.svg) {
      const { svg } = req.files;
      const cloudiRes = await cloudinary.uploader.upload(svg.tempFilePath, {
        folder: "SKILLICONS",
      });

      if (!cloudiRes || cloudiRes.error) {
        return next(new ErrorHandler("Cloudinary Error for Skill Icon", 500));
      }
      svgPublicId = cloudiRes.public_id;
      svgUrl = cloudiRes.secure_url;
    } else if (req.body.svg) {
      svgUrl = req.body.svg;
    } else {
      return next(new ErrorHandler("Skill icon (file or URL) is required!", 400));
    }

    const id = crypto.randomUUID();
    const sql = `
      INSERT INTO "Skill" (id, title, proficiency, category, "svgPublicId", "svgUrl", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [id, title, proficiency, category || 'UI / Presentation', svgPublicId, svgUrl];

    const { rows } = await query(sql, values);
    const skill = rows[0];

    res.status(200).json({ success: true, message: "New Skill added", skill });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to add skill", 500));
  }
});

// DELETE SKILL
export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT "svgPublicId" FROM "Skill" WHERE id = $1', [id]);
    const skill = rows[0];

    if (!skill) {
      return next(new ErrorHandler("Skill not found!", 404));
    }

    if (skill.svgPublicId) {
      await cloudinary.uploader.destroy(skill.svgPublicId);
    }
    await query('DELETE FROM "Skill" WHERE id = $1', [id]);

    res.status(200).json({ success: true, message: "Skill deleted!" });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to delete skill", 500));
  }
});

// UPDATE SKILL
export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { proficiency, category } = req.body;

    if (!proficiency) {
      return next(new ErrorHandler("Proficiency is required!", 400));
    }

    const sql = 'UPDATE "Skill" SET proficiency = $1, category = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *';
    const { rows } = await query(sql, [proficiency, category || 'UI / Presentation', id]);
    const skill = rows[0];

    if (!skill) {
      return next(new ErrorHandler("Skill Not Found!", 404));
    }

    res.status(200).json({ success: true, message: "Skill Updated", skill });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to update skill", 500));
  }
});

// GET ALL SKILLS
export const getAllSkill = catchAsyncErrors(async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM "Skill" ORDER BY "createdAt" DESC');
    const allSkill = rows || [];

    res.status(200).json({ success: true, allSkill });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to fetch skills", 500));
  }
});
