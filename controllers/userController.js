import { catchAsyncErrors } from "../middlewares/catchAsynErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudiinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import cloudinary from "cloudinary";

//REGISTER
export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Avatar and Resume are Required!"));
  }

  const { avatar } = req.files;

  const cloudiAvatarRes = await cloudiinary.uploader.upload(
    avatar.tempFilePath,
    {
      folder: "AVATARS",
    }
  );

  if (!cloudiAvatarRes || cloudiAvatarRes.error) {
    console.error(
      `Coudinary Error For Avatar`,
      error || "Unknow Cloudinary error"
    );
  }

  const cloudiResumeRes = await cloudiinary.uploader.upload(
    resume.tempFilePath,
    {
      folder: "RESUMES",
    }
  );

  if (!cloudiResumeRes || cloudiResumeRes.error) {
    console.error(
      `Coudinary Error For Resume`,
      error || "Unknow Cloudinary error"
    );
  }

  const {
    fullName,
    email,
    password,
    phone,
    aboutMe,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedinURL,
    resetPasswordToken,
    resetPasswordExpire,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    aboutMe,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    facebookURL,
    linkedinURL,
    resetPasswordToken,
    resetPasswordExpire,
    avatar: {
      public_id: cloudiAvatarRes.public_id,
      url: cloudiAvatarRes.secure_url,
    },
    resume: {
      public_id: cloudiResumeRes.public_id,
      url: cloudiResumeRes.secure_url,
    },
  });

  generateToken(user, "User Registered", 201, res);
});

//LOGIN
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email or Password is Required!"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler(" InValid Email or Password!", 404));
  }

  const isPassMatch = await user.comparePassword(password);

  if (!isPassMatch) {
    return next(new ErrorHandler("password is in correct!", 404));
  }

  generateToken(user, "Logged In", 200, res);
});

//LOGOUT
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out",
    });
});

//GET-USER
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not Found!"));
  }
  res.status(200).json({
    success: true,
    message: "User Found",
    user,
  });
});

//UPDATE PROFILE

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newProfile = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    portfolioURL: req.body.portfolioURL,
    linkedinURL: req.body.githubURL,
    githubURL: req.body.instagramURL,
    instagramURL: req.body.instagramURL,
    twitterURL: req.body.twitterURL,
    facebookURL: req.body.facebookURL,
  };

  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);

    const avatarImgid = user.avatar.public_id;
    await cloudiinary.uploader.destroy(avatarImgid);

    const cloudiRes = await cloudiinary.uploader.upload(avatar.tempFilePath, {
      folder: "AVATARS",
    });

    newProfile.avatar = {
      public_id: cloudiRes.public_id,
      url: cloudiRes.secure_url,
    };
  }

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);
    const resumeId = user.resume.public_id;
    await cloudiinary.uploader.destroy(resumeId);

    const cloudiRes = await cloudiinary.uploader.upload(resume.tempFilePath, {
      folder: "RESUMES",
    });

    newProfile.resume = {
      public_id: cloudiRes.public_id,
      url: cloudiRes.secure_url,
    };
  }

  //   fullName,
  //   email,
  //   phone,
  //   aboutMe,
  //   portfolioURL,
  //   linkedinURL,
  //   githubURL,
  //   instagramURL,
  //   twitterURL,
  //   facebookURL,
  //   resume,
  //   avatar
  // );

  const user = await User.findByIdAndUpdate(req.user.id, newProfile, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Profile Updated",
    user,
  });
});

//UPADTE PASSWORD
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPass, newPass, confirmNewPass } = req.body;

  if (!currentPass || !newPass || !confirmNewPass) {
    return next(new ErrorHandler("Please fill The All Input Fields", 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  const isPassMatch = await user.comparePassword(currentPass);

  if (!isPassMatch) {
    return next(new ErrorHandler("Incorrect current Password", 400));
  }

  if (newPass !== confirmNewPass) {
    return next(
      new ErrorHandler(
        " New Password and Confirm New Password is Not Matched",
        400
      )
    );
  }

  user.password = newPass;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password is Updated!",
  });
});

//GET USER FOR PORTFOLIO
export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = process.env.USER_ID;
  
  try {
    const userDoc = await User.findById(id);
    const user = userDoc.toObject();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(
      new ErrorHandler("Error Occured While Fetching User Data", 400)
    );
  }
});

//FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is Reuired!", 400));
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.DASHBOARD_URL}/forgot/password/reset/${resetToken}`;

  const message = `Your reset Password Token is :- \n\n ${resetPasswordUrl} \n\n if You've not requested for this please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Personal Portfolio Dashboard Recovery",
      message,
    });
  } catch (error) {
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }

  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email} Successfully`,
  });
});

//RESET PASSWORD
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password Token is Invalid or Expired!", 400)
    );
  }

  if (req.body.password !== req.body.confirmNewPass) {
    return next(
      new ErrorHandler(
        "Password and New Confirm Passwor is Not Matched!, Please Try agin",
        400
      )
    );
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  generateToken(user, "Reset Password Succesfully", 200, res);
});
