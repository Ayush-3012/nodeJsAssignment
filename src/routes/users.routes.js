import { Router } from "express";
import {
  deleteUser,
  loginUser,
  modifyUserDetails,
  signupUser,
} from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../utils/token-manager.js";

const userRouter = Router();

userRouter
  .route("/signup")
  .post(upload.fields([{ name: "profileImage", maxCount: 1 }]), signupUser);
userRouter.route("/login").post(verifyToken, upload.fields([{}]), loginUser);
userRouter
  .route("/modifyUserDetails")
  .patch(
    verifyToken,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    modifyUserDetails
  );
userRouter.route("/delete").delete(verifyToken, deleteUser);

export default userRouter;
