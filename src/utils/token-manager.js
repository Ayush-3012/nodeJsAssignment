import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (id, role, expiresIn) => {
  const payload = { id, role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};

export const verifyToken = async (req, res, next) => {
  const token = req.signedCookies[`${COOKIE_NAME}`];
  if (!token || token.trim() === "")
    return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, success) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });

    const { id, role } = success;
    req.userType = role;
    req.userId = id;
    next();
  });
};
