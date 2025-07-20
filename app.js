import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dbConnection from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./routes/messageRouter.js";
import userRouter from "./routes/userRouter.js";
import timelineRouter from "./routes/timelineRouter.js";
import appRouter from "./routes/appRouter.js";
import skillRouter from "./routes/skillRouter.js";
import projectRouter from "./routes/projectRouter.js";


const app = express();
dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
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

app.use("/message", messageRouter);
app.use("/user", userRouter);
app.use("/timeline", timelineRouter);
app.use("/application", appRouter);
app.use("/skill", skillRouter);
app.use("/project", projectRouter);

dbConnection();

app.use(errorMiddleware);
export default app;
