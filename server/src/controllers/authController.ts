import { Request, Response, NextFunction } from "express";
import pool from "../database/database";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { CatchAsync } from "../utils/CatchAsync";
import dotenv from "dotenv";

dotenv.config();

interface auth_request extends Request {
  user?: any;
}

export const register_users = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, password } = req.body;

    const hashed_password = await bcrypt.hash(password, 10);

    const inserted_user = await pool.query(
      "insert into users (username, password) values ($1, $2) returning username;",
      [username, hashed_password],
    );

    const created_username: string = inserted_user.rows[0].username;

    res.status(201).json({
      status: "success",
      message: `User ${created_username} has been created successfully`,
    });
  },
);

export const login_users = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const username: string = req.body.username;
    const request_password: string = req.body.password;

    const valid_user = await pool.query(
      "select * from users where username = $1",
      [username],
    );

    if (valid_user.rows.length === 0) {
      return next(new AppError("username or password is incorrect", 401));
    }

    const user_password: string = valid_user.rows[0].password;

    const user_name: string = valid_user.rows[0].username;

    const user_id: number = valid_user.rows[0].id;

    const user_role: string = valid_user.rows[0].role;

    const user_access_scope: string = valid_user.rows[0].access_scope;

    const user_script_execution_scope: string =
      valid_user.rows[0].script_execution_scope;

    const valid_password = await bcrypt.compare(
      request_password,
      user_password,
    );

    if (!valid_password) {
      return next(new AppError("username or password is incorrect", 401));
    }

    const user = {
      user_name,
      user_id,
      user_role,
      user_access_scope,
      user_script_execution_scope,
    };

    const access_token = jwt.sign(user, process.env.JWT_SECRET_TOKEN!, {
      expiresIn: "15m",
    });

    const refresh_token = jwt.sign(user, process.env.JWT_REFRESH_TOKEN!, {
      expiresIn: "30d",
    });

    res.cookie("refresh_token", refresh_token, { httpOnly: true });

    res.status(200).json({
      message: "login sucess",
      token: access_token,
    });
  },
);

export const refresh_access_token = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return next(new AppError("Missing refresh token", 401));
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN!,
      (error: VerifyErrors | null, decoded: any) => {
        if (error) {
          return next(new AppError("token has failed", 403));
        }

        const user = {
          user_name: decoded.user_name,
          user_id: decoded.user_id,
          user_role: decoded.user_role,
          user_access_scope: decoded.user_access_scope,
          user_script_execution_scope: decoded.user_script_execution_scope,
        };

        const access_token = jwt.sign(user, process.env.JWT_SECRET_TOKEN!, {
          expiresIn: "15m",
        });

        res.status(200).json({
          token: access_token,
        });
      }
    );
  }
);

export const logout_user = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.clearCookie("refresh_token");

    res.status(200).json({ message: `refresh_token deleted`, });
  }
);

export const authenticate_jwt_token = (
  req: auth_request,
  res: Response,
  next: NextFunction,
): void => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  jwt.verify(token, process.env.JWT_SECRET_TOKEN!, (error, user) => {
    if (error) {
      return next(new AppError("token has failed", 403));
    }

    req.user = user;

    next();
  });
};

export const restrictTo = (...roles: string[]) => {
  return (req: auth_request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.user_role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};

export const checkEntityAccess =
  (entityType: "system" | "service") =>
    async (req: auth_request, _res: Response, next: NextFunction) => {
      const entityId = Number(req.params.id);

      if (!Number.isFinite(entityId)) {
        return next(new AppError("Invalid entity id", 400));
      }

      // If user has total scope, skip and continue
      if (req.user.user_access_scope === "total") return next();

      // custom scope: verify allowlist
      const column = entityType === "system" ? "system_id" : "service_id";

      const { rowCount } = await pool.query(
        `SELECT 1 FROM user_entity_access
       WHERE user_id = $1 AND ${column} = $2`,
        [req.user.user_id, entityId],
      );

      if (rowCount === 0) {
        return next(
          new AppError("You do not have permission to this entity", 403),
        );
      }

      next();
    };

export const checkEntityAccessByQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const type = String(req.query.type || "");

  if (type !== "system" && type !== "service") {
    return next(
      new AppError("Query param 'type' must be 'system' or 'service'", 400),
    );
  }

  // * currying used (functional paradigm): first pass the entity type, then invoke the returned middleware with (req, res, next)
  return checkEntityAccess(type as "system" | "service")(req, res, next);
};

export const checkEntityAccessDocs = async (
  req: auth_request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user.user_access_scope === "total") return next();

  const type = String(req.query.type || "");

  if (type !== "system" && type !== "service") {
    return next(
      new AppError("Query param 'type' must be 'system' or 'service'", 400),
    );
  }

  const doc_id = Number(req.params.id);

  if (!Number.isFinite(doc_id)) {
    return next(new AppError("Invalid entity id", 400));
  }

  const column = type === "system" ? "system_id" : "service_id";

  const table = type === "system" ? "system_docs" : "service_docs";

  const parent_id = await pool.query(
    `select ${column} from ${table} where id = $1;`,
    [doc_id],
  );

  if (parent_id.rows.length === 0) {
    return next(new AppError("id doesn't exist", 400));
  }

  const entityId = parent_id.rows[0][column];

  const { rowCount } = await pool.query(
    `SELECT 1 FROM user_entity_access
       WHERE user_id = $1 AND ${column} = $2`,
    [req.user.user_id, entityId],
  );

  if (rowCount === 0) {
    return next(new AppError("You do not have permission to this entity", 403));
  }

  next();
};

export const checkEntityAccessDocsUpdate =
  (entityType: "system" | "service") =>
    async (req: auth_request, res: Response, next: NextFunction) => {
      if (req.user.user_access_scope === "total") return next();

      const doc_id = Number(req.params.id);

      if (!Number.isFinite(doc_id)) {
        return next(new AppError("Invalid entity id", 400));
      }

      const column = entityType === "system" ? "system_id" : "service_id";

      const table = entityType === "system" ? "system_docs" : "service_docs";

      const parent_id = await pool.query(
        `select ${column} from ${table} where id = $1;`,
        [doc_id],
      );

      if (parent_id.rows.length === 0) {
        return next(new AppError("id doesn't exist", 400));
      }

      const entityId = parent_id.rows[0][column];

      const { rowCount } = await pool.query(
        `SELECT 1 FROM user_entity_access
       WHERE user_id = $1 AND ${column} = $2`,
        [req.user.user_id, entityId],
      );

      if (rowCount === 0) {
        return next(
          new AppError("You do not have permission to this entity", 403),
        );
      }

      next();
    };

export const checkScriptAccess =
  (scriptType: "system" | "service") =>
    async (req: auth_request, _res: Response, next: NextFunction) => {
      const scriptId = Number(req.params.id);

      if (!Number.isFinite(scriptId)) {
        return next(new AppError("Invalid script id", 400));
      }

      if (req.user.user_script_execution_scope === "total") return next();

      const column =
        scriptType === "system" ? "system_script_id" : "service_script_id";

      const { rowCount } = await pool.query(
        `SELECT 1
       FROM user_script_access
       WHERE user_id = $1 AND ${column} = $2`,
        [req.user.user_id, scriptId],
      );

      if (rowCount === 0) {
        return next(
          new AppError("You do not have permission to this script", 403),
        );
      }

      next();
    };
