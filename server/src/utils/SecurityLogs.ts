import { Request, Response, NextFunction } from "express";
import pool from "../database/database";

export function logRequests(req: Request, res: Response, next: NextFunction) {
  res.on("finish", async () => {
    try {
      const userId = (req as any)?.user?.user_id ?? null;
      const action = req.method;
      const route = req.originalUrl;
      const statusCode = res.statusCode;

      const shouldSkipBody =
        req.method === "POST" &&
        ["/api/v1/auth/register", "/api/v1/auth/login"].includes(req.originalUrl);

      const body = shouldSkipBody ? null : req.body;

      await pool.query(
        `insert into logs (user_id, action, route, status_code, body)
         values ($1, $2, $3, $4, $5)`,
        [userId, action, route, statusCode, body]
      );
    } catch (err: any) {
      console.error("Log insert failed:", err?.message || err);
    }
  });

  next();
}
