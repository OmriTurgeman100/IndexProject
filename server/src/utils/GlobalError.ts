import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const sendErrorDev = (error: any, res: Response): void => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

const sendErrorProd = (error: any, res: Response): void => {
  if (error.operational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error(`ERROR ⚡`, error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const GlobalError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(error, res);
  }
};
