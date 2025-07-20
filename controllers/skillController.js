import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import cloudinary from "cloudinary";
import { Skill } from "../models/skillSchema.js";

//ADD SKILL
export const addSkill = catchAsyncErrors(async (req, res, next) => {
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Skill icon is required!", 400));
  }

  const { svg } = req.files;
  const { title, proficiency } = req.body;


  if (!title || !proficiency) {
    return next(new ErrorHandler("Title and Proficiency is Required!", 400));
  }

  const cloudiRes = await cloudinary.uploader.upload(svg.tempFilePath, {
    folder: "SKILLICONS",
  });

  if (!cloudiRes || cloudiRes.error) {
    console.error(
      "Cloudinary Error :",
      cloudiRes.error || "Unknown Cloudinary Error"
    );
  }

  const skill = await Skill.create({
    title,
    proficiency,
    svg: {
      public_id: cloudiRes.public_id,
      url: cloudiRes.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Skill added",
    skill,
  });
});

//DELETE SKILL
export const deleteSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const skill = await Skill.findById(id);

  if (!skill) {
    return next(new ErrorHandler("Skill not found!", 404));
  }
  const svgId = skill.svg.public_id;
  await cloudinary.uploader.destroy(svgId);
  await skill.deleteOne();

  res.status(200).json({
    success: true,
    message: "Skill deleted!",
  });
});

// Update Skill
export const updateSkill = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let skill = await Skill.findById(id)

  if (!skill) {
    return next(new ErrorHandler("Skill Not Found!", 404))
  }

  const { proficiency } = req.body;

  if (!proficiency) {
    return next(new ErrorHandler("Proficiency is required!", 400))
  }

  skill = await Skill.findByIdAndUpdate(id,
    { proficiency },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  )

  res.status(200).json({
    success: true,
    message: "Skill Updated",
    skill
  })
});

export const getAllSkill = catchAsyncErrors(async (req, res, next) => {
  const allSkill = await Skill.find();

  if (!allSkill || allSkill.length === 0) {
    return next(new ErrorHandler("There is no Skill, please add skills"));
  }

  res.status(200).json({
    success: true,
    allSkill,
  });
});
