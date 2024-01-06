import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constans.js";

export const verifyToken = async (req, res, next) => {
  const token = req.signedCookies[`${COOKIE_NAME}`];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });

    const { userType, userId } = success;
    req.userType = userType;
    req.userId = userId;
    next();
  });
};
