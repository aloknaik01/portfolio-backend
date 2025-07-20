import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { senderName, subject, message } = req.body;

  if (!senderName || !subject || !message) {
    return next(new ErrorHandler("Please Fill The All input Fields"));
  }

  const data = await Message.create({ senderName, subject, message });
  res.status(200).json({
    success: true,
    message: "Message Sent",
    data,
  });
});

export const getallMessage = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();
  res.status(200).json({
    success: true,
    messages,
  });
});

export const getMessageById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const message = await Message.findById(id);

  if (!message) {
    return next(new ErrorHandler("Message Not Found!", 404));
  }
  res.status(200).json({
    success: true,
    message: "User Find",
    message,
  });
});

export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);

  if (!message) {
    return next(new ErrorHandler("Message is already deleted!", 400));
  }
  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: "Message Deleted",
  });
});
