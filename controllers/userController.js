import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { query } from "../database/dbConnection.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// REGISTER
export const register = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName, email, password, phone, aboutMe, portfolioURL,
    githubURL, instagramURL, twitterURL, facebookURL, linkedinURL,
  } = req.body;

  if (!fullName || !email || !password || !phone || !aboutMe || !portfolioURL) {
    return next(new ErrorHandler("Please provide Full Name, Email, Password, Phone Number, About Me, and Portfolio URL!", 400));
  }

  if (!req.files || !req.files.avatar || !req.files.resume) {
    return next(new ErrorHandler("Avatar and Resume are Required!", 400));
  }

  const { avatar, resume, heroVideo } = req.files;

  const cloudiAvatarRes = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "AVATARS",
    resource_type: "auto",
  });
  if (!cloudiAvatarRes || cloudiAvatarRes.error) {
    return next(new ErrorHandler("Cloudinary Error for Avatar", 500));
  }
  const avatarType = cloudiAvatarRes.resource_type;

  const cloudiResumeRes = await cloudinary.uploader.upload(resume.tempFilePath, {
    folder: "RESUMES",
  });
  if (!cloudiResumeRes || cloudiResumeRes.error) {
    return next(new ErrorHandler("Cloudinary Error for Resume", 500));
  }

  let heroVideoUrl, heroVideoPublicId;
  if (heroVideo) {
    const cloudiHeroRes = await cloudinary.uploader.upload(heroVideo.tempFilePath, {
      folder: "HERO_VIDEOS",
      resource_type: "video",
    });
    heroVideoUrl = cloudiHeroRes.secure_url;
    heroVideoPublicId = cloudiHeroRes.public_id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  const sql = `
    INSERT INTO "User" (
      id, "fullName", email, password, phone, "aboutMe", "portfolioURL",
      "githubURL", "instagramURL", "twitterURL", "facebookURL", "linkedinURL",
      "avatarPublicId", "avatarUrl", "avatarType", "resumePublicId", "resumeUrl", 
      "heroVideoUrl", "heroVideoPublicId", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
    RETURNING *
  `;
  const values = [
    id, fullName, email, hashedPassword, phone, aboutMe, portfolioURL,
    githubURL, instagramURL, twitterURL, facebookURL, linkedinURL,
    cloudiAvatarRes.public_id, cloudiAvatarRes.secure_url, avatarType,
    cloudiResumeRes.public_id, cloudiResumeRes.secure_url,
    heroVideoUrl, heroVideoPublicId
  ];

  const { rows } = await query(sql, values);
  const user = rows[0];

  generateToken(user, "User Registered", 201, res);
});

// LOGIN
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email or Password is Required!", 400));
  }

  const { rows } = await query('SELECT * FROM "User" WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password!", 404));
  }

  const isPassMatch = await bcrypt.compare(password, user.password);
  if (!isPassMatch) {
    return next(new ErrorHandler("Password is incorrect!", 400));
  }

  generateToken(user, "Logged In", 200, res);
});

// LOGOUT
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None"
    })
    .json({ success: true, message: "Logged Out" });
});

// GET USER (Authenticated)
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const { rows } = await query('SELECT * FROM "User" WHERE id = $1', [req.user.id]);
  const user = rows[0];

  if (!user) return next(new ErrorHandler("User not Found!", 404));

  delete user.password;
  res.status(200).json({ success: true, message: "User Found", user });
});

// UPDATE PROFILE
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName, email, phone, aboutMe, portfolioURL, linkedinURL,
    githubURL, instagramURL, twitterURL, facebookURL
  } = req.body;

  if (!fullName || !email || !phone || !aboutMe || !portfolioURL) {
    return next(new ErrorHandler("Please provide Full Name, Email, Phone Number, About Me, and Portfolio URL!", 400));
  }

  let avatarPublicId, avatarUrl, avatarType, resumePublicId, resumeUrl, heroVideoUrl, heroVideoPublicId;

  const { rows: userRows } = await query('SELECT * FROM "User" WHERE id = $1', [req.user.id]);
  const currentUser = userRows[0];

  if (req.files && req.files.avatar) {
    if (currentUser.avatarPublicId) {
      await cloudinary.uploader.destroy(currentUser.avatarPublicId, { resource_type: currentUser.avatarType === 'video' ? 'video' : 'image' });
    }
    const cloudiRes = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, {
      folder: "AVATARS",
      resource_type: "auto",
    });
    avatarPublicId = cloudiRes.public_id;
    avatarUrl = cloudiRes.secure_url;
    avatarType = cloudiRes.resource_type;
  } else {
    avatarPublicId = currentUser.avatarPublicId;
    avatarUrl = currentUser.avatarUrl;
    avatarType = currentUser.avatarType;
  }

  if (req.files && req.files.resume) {
    if (currentUser.resumePublicId) {
      await cloudinary.uploader.destroy(currentUser.resumePublicId);
    }
    const cloudiRes = await cloudinary.uploader.upload(req.files.resume.tempFilePath, {
      folder: "RESUMES",
    });
    resumePublicId = cloudiRes.public_id;
    resumeUrl = cloudiRes.secure_url;
  } else {
    resumePublicId = currentUser.resumePublicId;
    resumeUrl = currentUser.resumeUrl;
  }

  if (req.files && req.files.heroVideo) {
    if (currentUser.heroVideoPublicId) {
      await cloudinary.uploader.destroy(currentUser.heroVideoPublicId, { resource_type: "video" });
    }
    const cloudiRes = await cloudinary.uploader.upload(req.files.heroVideo.tempFilePath, {
      folder: "HERO_VIDEOS",
      resource_type: "video",
    });
    heroVideoUrl = cloudiRes.secure_url;
    heroVideoPublicId = cloudiRes.public_id;
  } else {
    heroVideoUrl = currentUser.heroVideoUrl;
    heroVideoPublicId = currentUser.heroVideoPublicId;
  }

  const sql = `
    UPDATE "User" SET
      "fullName" = $1, email = $2, phone = $3, "aboutMe" = $4, "portfolioURL" = $5,
      "linkedinURL" = $6, "githubURL" = $7, "instagramURL" = $8, "twitterURL" = $9,
      "facebookURL" = $10, "avatarPublicId" = $11, "avatarUrl" = $12, "avatarType" = $13,
      "resumePublicId" = $14, "resumeUrl" = $15, "heroVideoUrl" = $16, "heroVideoPublicId" = $17, 
      "updatedAt" = NOW()
    WHERE id = $18
    RETURNING *
  `;
  const values = [
    fullName, email, phone, aboutMe, portfolioURL, linkedinURL,
    githubURL, instagramURL, twitterURL, facebookURL,
    avatarPublicId, avatarUrl, avatarType,
    resumePublicId, resumeUrl, heroVideoUrl, heroVideoPublicId, req.user.id
  ];

  const { rows } = await query(sql, values);
  const user = rows[0];

  delete user.password;
  res.status(200).json({ success: true, message: "Profile Updated", user });
});

// UPDATE PASSWORD
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPass, newPass, confirmNewPass } = req.body;

  if (!currentPass || !newPass || !confirmNewPass) {
    return next(new ErrorHandler("Please fill all input fields", 400));
  }

  const { rows } = await query('SELECT password FROM "User" WHERE id = $1', [req.user.id]);
  const user = rows[0];

  const isPassMatch = await bcrypt.compare(currentPass, user.password);
  if (!isPassMatch) {
    return next(new ErrorHandler("Incorrect current Password", 400));
  }

  if (newPass !== confirmNewPass) {
    return next(new ErrorHandler("New Password and Confirm Password do not match", 400));
  }

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2', [hashedPassword, req.user.id]);

  res.status(200).json({ success: true, message: "Password is Updated!" });
});

// GET USER FOR PORTFOLIO (Public)
export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const { rows } = await query('SELECT * FROM "User" LIMIT 1');
  if (rows.length === 0) {
    return next(new ErrorHandler("No user found", 404));
  }
  const user = rows[0];
  delete user.password;
  res.status(200).json({ success: true, user });
});

// FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Email is Required!", 400));

  const { rows } = await query('SELECT id, email FROM "User" WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) return next(new ErrorHandler("User Not Found!", 404));

  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

  await query(
    'UPDATE "User" SET "resetPasswordToken" = $1, "resetPasswordExpire" = $2, "updatedAt" = NOW() WHERE id = $3',
    [resetPasswordToken, resetPasswordExpire, user.id]
  );

  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/forgot/password/reset/${resetToken}`;
  const message = `Your reset Password Token is :- \n\n ${resetPasswordUrl} \n\n If you've not requested this, please ignore it.`;

  try {
    await sendEmail({ email: user.email, subject: "Personal Portfolio Dashboard Recovery", message });
  } catch (error) {
    await query(
      'UPDATE "User" SET "resetPasswordToken" = NULL, "resetPasswordExpire" = NULL, "updatedAt" = NOW() WHERE id = $1',
      [user.id]
    );
    return next(new ErrorHandler(error.message, 500));
  }

  res.status(200).json({ success: true, message: `Email sent to ${user.email} Successfully` });
});

// RESET PASSWORD
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

  const { rows } = await query(
    'SELECT * FROM "User" WHERE "resetPasswordToken" = $1 AND "resetPasswordExpire" > NOW()',
    [resetPasswordToken]
  );
  const user = rows[0];

  if (!user) {
    return next(new ErrorHandler("Reset Password Token is Invalid or Expired!", 400));
  }

  if (req.body.password !== req.body.confirmNewPass) {
    return next(new ErrorHandler("Password and Confirm Password do not match!", 400));
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await query(
    'UPDATE "User" SET password = $1, "resetPasswordToken" = NULL, "resetPasswordExpire" = NULL, "updatedAt" = NOW() WHERE id = $2',
    [hashedPassword, user.id]
  );

  generateToken(user, "Reset Password Successfully", 200, res);
});
