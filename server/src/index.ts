import express from "express";
import helmet from "helmet";
import cors from "cors";
import serviceRouter from "./routes/serviceRouter";
import systemRouter from "./routes/systemRouter";
import fieldRouter from "./routes/fieldRouter";
import visualizationRouter from "./routes/visualizationRouter";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import { Request, Response, NextFunction } from "express";
import AppError from "./utils/AppError";
import { GlobalError } from "./utils/GlobalError";
import { logRequests } from "./utils/SecurityLogs";
import cookieParser from "cookie-parser";

const app = express();
const port: number = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

app.use(logRequests);

app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/systems", systemRouter);
app.use("/api/v1/visualization", visualizationRouter);
app.use("/api/v1/fields", fieldRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);


app.use("*", (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Cant find ${req.originalUrl} on the server`, 401));
});

app.use(GlobalError);

app.listen(port, () => {
  console.log(
    `🚀 Server is up and running! Access it at: http://localhost:${port}/`
  );
});
// ! taskkill /F /IM node.exe /T


