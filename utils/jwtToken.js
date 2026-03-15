import jwt from "jsonwebtoken";

export const generateToken = (user, message, statusCode, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  const safeUser = { ...user };
  delete safeUser.password;

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None"
    })
    .json({
      success: true,
      message,
      token,
      user: safeUser,
    });
};
