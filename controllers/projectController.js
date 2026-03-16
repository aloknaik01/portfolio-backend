import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// ADD PROJECT
export const addProject = catchAsyncErrors(async (req, res, next) => {
  try {
    const { title, description, gitLink, projectLink, technologies, stack, deployed, category } = req.body;

    if (!title || !description) {
      return next(new ErrorHandler("Title and description are Required!", 400));
    }

    let bannerPublicId = "";
    let bannerUrl = "";

    if (req.files && req.files.projectBanner) {
      const { projectBanner } = req.files;
      const cloudiRes = await cloudinary.uploader.upload(projectBanner.tempFilePath, {
        folder: "PROJECTS",
      });

      if (!cloudiRes || cloudiRes.error) {
        return next(new ErrorHandler("Cloudinary Error for Project Banner", 500));
      }
      bannerPublicId = cloudiRes.public_id;
      bannerUrl = cloudiRes.secure_url;
    } else if (req.body.projectBanner) {
      bannerUrl = req.body.projectBanner;
    } else {
      return next(new ErrorHandler("Banner of Project (file or URL) is required!", 400));
    }

    // Handle Screenshots
    let screenshots = [];
    if (req.files && req.files.screenshots) {
      let screenshotFiles = req.files.screenshots;
      if (!Array.isArray(screenshotFiles)) {
        screenshotFiles = [screenshotFiles];
      }

      for (const file of screenshotFiles) {
        const res = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "PROJECTS/SCREENSHOTS",
        });
        screenshots.push({
          public_id: res.public_id,
          url: res.secure_url
        });
      }
    }

    const id = crypto.randomUUID();
    const sql = `
      INSERT INTO "Project" (
        id, title, description, "gitLink", "projectLink", technologies, stack, deployed, category,
        "bannerPublicId", "bannerUrl", screenshots, "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *
    `;
    const values = [
      id, title, description, gitLink, projectLink, technologies, stack, deployed, category || 'Full Stack',
      bannerPublicId, bannerUrl, JSON.stringify(screenshots)
    ];

    const { rows } = await query(sql, values);
    const newProject = rows[0];

    res.status(200).json({ success: true, message: "New Project Added", newProject });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to add project", 500));
  }
});

// DELETE PROJECT
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT "bannerPublicId", screenshots FROM "Project" WHERE id = $1', [id]);
    const project = rows[0];

    if (!project) {
      return next(new ErrorHandler("Project not found!", 404));
    }

    if (project.bannerPublicId) {
      await cloudinary.uploader.destroy(project.bannerPublicId);
    }

    // Delete screenshots from Cloudinary
    if (project.screenshots) {
      const screenshots = typeof project.screenshots === 'string' ? JSON.parse(project.screenshots) : project.screenshots;
      for (const ss of screenshots) {
        await cloudinary.uploader.destroy(ss.public_id);
      }
    }

    await query('DELETE FROM "Project" WHERE id = $1', [id]);

    res.status(200).json({ success: true, message: "Project deleted!" });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to delete project", 500));
  }
});

// GET ALL PROJECTS
export const getallProjects = catchAsyncErrors(async (req, res, next) => {
  const { rows } = await query('SELECT * FROM "Project" ORDER BY "createdAt" DESC');
  const allProjects = rows || [];

  res.status(200).json({ success: true, allProjects });
});

// GET ONE PROJECT
export const getOneProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { rows } = await query('SELECT * FROM "Project" WHERE id = $1', [id]);
  const project = rows[0];

  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }

  res.status(200).json({ success: true, project });
});

// UPDATE PROJECT
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, gitLink, projectLink, technologies, stack, deployed, category } = req.body;

    const { rows: projectRows } = await query('SELECT * FROM "Project" WHERE id = $1', [id]);
    const currentProject = projectRows[0];

    if (!currentProject) {
      return next(new ErrorHandler("Project Not Found!", 404));
    }

    let bannerPublicId = currentProject.bannerPublicId;
    let bannerUrl = currentProject.bannerUrl;

    if (req.files && req.files.projectBanner) {
      if (currentProject.bannerPublicId) {
        await cloudinary.uploader.destroy(currentProject.bannerPublicId);
      }
      const cloudiRes = await cloudinary.uploader.upload(req.files.projectBanner.tempFilePath, {
        folder: "PROJECTS",
      });
      bannerPublicId = cloudiRes.public_id;
      bannerUrl = cloudiRes.secure_url;
    } else if (req.body.projectBanner) {
      if (currentProject.bannerPublicId) {
        await cloudinary.uploader.destroy(currentProject.bannerPublicId);
      }
      bannerPublicId = "";
      bannerUrl = req.body.projectBanner;
    }

    // Handle Screenshots Update
    let screenshots = currentProject.screenshots ? (typeof currentProject.screenshots === 'string' ? JSON.parse(currentProject.screenshots) : currentProject.screenshots) : [];
    
    if (req.files && req.files.screenshots) {
      let screenshotFiles = req.files.screenshots;
      if (!Array.isArray(screenshotFiles)) {
        screenshotFiles = [screenshotFiles];
      }

      for (const file of screenshotFiles) {
        const res = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "PROJECTS/SCREENSHOTS",
        });
        screenshots.push({
          public_id: res.public_id,
          url: res.secure_url
        });
      }
    }

    const sql = `
      UPDATE "Project" SET
        title = $1, description = $2, "gitLink" = $3, "projectLink" = $4,
        technologies = $5, stack = $6, deployed = $7, "bannerPublicId" = $8,
        "bannerUrl" = $9, category = $10, screenshots = $11, "updatedAt" = NOW()
      WHERE id = $12
      RETURNING *
    `;
    const values = [
      title, description, gitLink, projectLink, technologies, stack, deployed,
      bannerPublicId, bannerUrl, category || currentProject.category, JSON.stringify(screenshots), id
    ];

    const { rows } = await query(sql, values);
    const project = rows[0];

    res.status(200).json({ success: true, message: "Project Updated!", project });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to update project", 500));
  }
});
