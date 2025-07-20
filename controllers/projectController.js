import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Projects } from "../models/projectSchema.js";
import cloudinary from "cloudinary";

//ADD PROJECT
export const addProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Banner of Project is required!"));
  }

  const { projectBanner } = req.files;
  const {
    title,
    description,
    gitLink,
    projectLink,
    technologies,
    stack,
    deployed,
  } = req.body;

  if (!title || !description) {
    return next(new ErrorHandler("Title and description  is Required!"));
  }

  const cloudiRes = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    {
      folder: "PROJECTS",
    }
  );

  if (cloudiRes.error || !cloudiRes) {
    console.error(
      "Cluodinary Error:",
      cloudiRes.error || "Unknown Cloudinary Error"
    );
  }

  const newProject = await Projects.create({
    title,
    description,
    gitLink,
    projectLink,
    technologies,
    stack,
    deployed,
    projectBanner: {
      public_id: cloudiRes.public_id,
      url: cloudiRes.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Project Added",
    newProject,
  });
});

//DELETE PROJECT
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Projects.findById(id);
  if (!project) {
    return next(new ErrorHandler("Project Deleted!"));
  }
  const bannerId = project.projectBanner.public_id;
  await cloudinary.uploader.destroy(bannerId);
  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: "Project deleted!",
  });
});

//GETALL PROJECT
export const getallProjects = catchAsyncErrors(async (req, res, next) => {
  const allProjects = await Projects.find();
  if (!allProjects || allProjects.length === 0) {
    return next(
      new ErrorHandler(
        "There is No Such Projects, Please add New Projects",
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    allProjects,
  });
});

//GETONE PROJECT
export const getOneProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Projects.findById(id);

  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }
  res.status(200).json({
    success: true,
    project,
  });
});

//UPDATE PROJECT
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProject = {
    title: req.body.title,
    description: req.body.description,
    gitLink: req.body.gitLink,
    projectLink: req.body.projectLink,
    technologies: req.body.technologies,
    stack: req.body.stack,
    deployed: req.body.deployed,
  };

  if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Projects.findById(req.params.id);

    const projectBannerId = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectBannerId);

    const cloudiRes = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PROJECTS",
      }
    );

    newProject.projectBanner = {
      public_id: cloudiRes.public_id,
      url: cloudiRes.secure_url,
    };
  }

  const project = await Projects.findByIdAndUpdate(req.params.id, newProject, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Project Updaetd!",
    project,
  });
});
