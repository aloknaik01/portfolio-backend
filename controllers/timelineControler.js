import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Timeline } from "../models/timelineSchema.js";

//POST TIMELINE
export const addTimeline = catchAsyncErrors(async (req, res, next) => {
  const { title, description, from, to } = req.body;

  if (!title || !description) {
    return next(new ErrorHandler("Title and Description is Required!", 400));
  }

  if (!from) {
    return next(new ErrorHandler("Joining Date is required!", 400));
  }

  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: { from, to },
  });

  res.status(200).json({
    success: true,
    message: "Timeline Added",
    newTimeline,
  });
});

//DELETE TIMELINE
export const deleteTimeline = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const timeline = await Timeline.findById(id);

  if (!timeline) {
    return next(new ErrorHandler("TimeLine not Found!", 400));
  }

  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: "Timeline Deleted!",
  });
});

export const getAllTimelines = catchAsyncErrors(async (req, res, next) => {
  const allTimeline = await Timeline.find();
  if (!allTimeline || allTimeline.length === 0) {
    return next(
      new ErrorHandler("Timeline is Empty! Please add TimeLines.", 400)
    );
  }

  res.status(200).json({
    success: true,
    allTimeline,
  });

});
