import cloudinary from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/appSchema.js";

//POST APPLICATION
export const addApplication = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Applicaion Icon is Required!", 400));
  }
  const { svg } = req.files;
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Application name is required!", 400));
  }

  const cloudiRes = await cloudinary.uploader.upload(svg.tempFilePath, {
    folder: "APPS",
  });

  if (!cloudiRes || cloudiRes.error) {
    console.error(
      "Cloudinary Error:",
      cloudiRes.error || "Unknown Cloudinary Error"
    );
  }

  const app = await Application.create({
    name,
    svg: {
      public_id: cloudiRes.public_id,
      url: cloudiRes.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Applicaion added",
    app,
  });
});

//DELETE APPLICATION
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findById(id);

  if (!application) {
    return next(new ErrorHandler("Application Not found", 404));
  }

  const svgId = application.svg.public_id;

  await cloudinary.uploader.destroy(svgId);

  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: "Application Deleted",
  });
});

//GETALL APPLICARION
export const getallApplication = catchAsyncErrors(async (req, res, next) => {
  const allApp = await Application.find();
  if (!allApp || allApp.length === 0) {
    return next(
      new ErrorHandler(
        "Application List is Empty!, Please Add Software application",
        400
      )
    );
  }

  res.status(200).json({
    success: true,
    allApp,
  });
});
