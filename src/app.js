import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => res.json("Hello Welcome"));

import userRouter from "./routes/users.routes.js";
import adminRouter from "./routes/admin.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);

export default app;
