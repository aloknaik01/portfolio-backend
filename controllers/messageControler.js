import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// SEND MESSAGE
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  try {
    const { senderName, subject, message, email } = req.body;

    if (!senderName || !subject || !message || !email) {
      return next(new ErrorHandler("Please fill all input fields (Name, Email, Subject, Message)", 400));
    }

    const id = crypto.randomUUID();
    const sql = `
      INSERT INTO "Message" (id, "senderName", subject, message, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id, senderName, subject, message, email];

    const { rows } = await query(sql, values);
    const data = rows[0];

    // Send email to owner
    const emailNotification = `You have received a new contact form submission from your Portfolio!
    
  Sender: ${senderName}
  Contact Email: ${email}
  
  Subject: ${subject}
  
  Message:
  ${message}
    `;

    try {
      await sendEmail({
        email: process.env.SMTP_MAIL, // Sending it to yourself
        subject: `Portfolio Message: ${subject}`,
        message: emailNotification,
      });
    } catch (error) {
      console.error("Email notification failed, but message was saved to DB:", error);
    }

    res.status(200).json({ success: true, message: "Transmission Confirmed and Saved!", data });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to send message", 500));
  }
});

// GET ALL MESSAGES
export const getallMessage = catchAsyncErrors(async (req, res, next) => {
  try {
    const { rows: messages } = await query('SELECT * FROM "Message" ORDER BY "createdAt" DESC');

    res.status(200).json({ success: true, messages });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to fetch messages", 500));
  }
});

// GET MESSAGE BY ID
export const getMessageById = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT * FROM "Message" WHERE id = $1', [id]);
    const message = rows[0];

    if (!message) {
      return next(new ErrorHandler("Message Not Found!", 404));
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to fetch message", 500));
  }
});

// DELETE MESSAGE
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query('DELETE FROM "Message" WHERE id = $1', [id]);

    if (rowCount === 0) {
      return next(new ErrorHandler("Message is already deleted!", 400));
    }

    res.status(200).json({ success: true, message: "Message Deleted" });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Failed to delete message", 500));
  }
});
