import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/User.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log(req.cookies);

  if (!token)
    return next(new ErrorHandler("Please login to access this page.", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
});

export const isAdmin = catchAsyncError(async (req, res, next) => {
  const { role } = req?.user;
  if (role !== "ADMIN")
    return next(
      new ErrorHandler("You are not allowed to access this page", 400)
    );
  next();
});
