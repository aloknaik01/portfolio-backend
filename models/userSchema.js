import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "FullName is Required!"],
  },
  email: {
    type: String,
    required: [true, "Email is Required!"],
  },
  password: {
    type: String,
    minLength: [8, "Password Should be atleast 8 Characters"],
    required: [true, "Password is Required!"],
    select: false,
  },
  phone: {
    type: String,
    minLength: [10, "Phone Number Mustbe Valid Number"],
    required: [true, "Phone Number is Required!"],
  },
  aboutMe: {
    type: String,
    required: [true, "AboutMe is Required!"],
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  portfolioURL: {
    type: String,
    required: [true, "Portfolio URL is Required"],
  },

  githubURL: String,
  instagramURL: String,
  twitterURL: String,
  facebookURL: String,
  linkedinURL: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//HASHING PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//COMPARE PASSWROD WITH HASHDED PASSWORD
userSchema.methods.comparePassword = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};

//GENRATIN WEB TOKEN
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
