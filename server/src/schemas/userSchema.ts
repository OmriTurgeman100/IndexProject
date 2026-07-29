import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const registerUserSchema = z.object({
  username: z.string().min(4, "Username must be at least 4 characters long"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    registerUserSchema.parse(req.body);

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400);
    }

    next(error);
  }
};
