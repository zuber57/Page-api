export const sendToken = (res, statusCode = 200, message, user) => {
  const token = user.getjwtToken();
 
  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    // httpOnly: true,
    // secure: false,
    // sameSite: "none",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
  });
};
