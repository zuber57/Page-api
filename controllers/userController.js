import User from "../models/User.js";
import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerController = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req?.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Enter all required fields", 400));
  }
  let userExist = await User.findOne({ email });
  if (userExist) {
    return next(new ErrorHandler("User already registered", 400));
  }

  const user = await User.create({ name, email, password });
  user.save();

  sendToken(res, 200, "User registered successfully", user);
});

export const loginController = catchAsyncError(async (req, res, next) => {
  const { email, password } = req?.body;
  if (!email || !password) {
    return next(new ErrorHandler("Enter all required fields", 400));
  }
  let user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  let isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  sendToken(res, 200, "Logged in successfully", user);
});

export const logoutController = catchAsyncError(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now()),
    // sameSite: "none",
    // httpOnly: true,
    // secure: true,
  };

  res.status(200).cookie("token", null, options).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateMyProfile = catchAsyncError(async (req, res, next) => {
  const { name, email, password, oldPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));
  user.name = name;
  let isPasswordMatched = await user.comparePassword(oldPassword);
  if (isPasswordMatched) {
    user.password = password;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated successfully",
  });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Enter email", 404));
  const user = await User.findOne({ email }).select("-password");

  if (!user) return next(new ErrorHandler("User does not exist", 404));

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const url = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Click on the link to reset your password ${url}. If you have not requested to reset your password please ignore this message`;

  // send EMail
  sendEmail("Email for reseting password", email, message);
  res.status(200).json({
    success: true,
    message: `Link for reseting password has been sent successfully to ${email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(
      new ErrorHandler("Invalid token or token has been expired", 400)
    );

  user.password = req?.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully",
  });
});

// ADMIN

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

export const changeUserRole = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  user.role = user.role === "ADMIN" ? "USER" : "ADMIN";
  await user.save();
  res.status(200).json({
    success: true,
    message: "User role has been changed",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next)=>{
  const {_id} = req.params;
  const user = await User.findByIdAndDelete({_id})
  res.status(200).json({
    success:true,
    message:"User Deleted Successfully"
  })
})
