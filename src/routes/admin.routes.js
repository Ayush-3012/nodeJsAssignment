import { Router } from "express";
import {
  createAdmin,
  deleteUser,
  getUserDetails,
  modifyUserDetails,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../utils/token-manager.js";
import { upload } from "../middlewares/multer.middleware.js";

const adminRouter = Router();

adminRouter
  .route("/create")
  .post(
    verifyToken,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    createAdmin
  );
adminRouter.route("/getUserDetails/:userId").get(getUserDetails);
adminRouter
  .route("/modifyUserDetials")
  .patch(
    verifyToken,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    modifyUserDetails
  );
adminRouter
  .route("/deleteUser/:userId")
  .delete(verifyToken, upload.fields([{}]), deleteUser);

export default adminRouter;
