import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./routes/messageRouter.js";
import userRouter from "./routes/userRouter.js";
import timelineRouter from "./routes/timelineRouter.js";
import appRouter from "./routes/appRouter.js";
import skillRouter from "./routes/skillRouter.js";
import projectRouter from "./routes/projectRouter.js";

const app = express();

app.use(
  cors({
    origin: [
      process.env.PORTFOLIO_URL?.replace(/\/$/, ""), 
      process.env.DASHBOARD_URL?.replace(/\/$/, "")
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ status: "Online", message: "Portfolio Backend is running" });
});

app.use("/message", messageRouter);
app.use("/user", userRouter);
app.use("/timeline", timelineRouter);
app.use("/application", appRouter);
app.use("/skill", skillRouter);
app.use("/project", projectRouter);

app.use(errorMiddleware);
export default app;
