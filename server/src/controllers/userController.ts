import { Request, Response, NextFunction } from "express";
import pool from "../database/database";
import { CatchAsync } from "../utils/CatchAsync";
import AppError from "../utils/AppError";

interface auth_request extends Request {
  user?: any;
}

export const display_user_permissions = CatchAsync(
  async (
    req: auth_request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const user_id = req.user.user_id;

    const users = await pool.query(
      "select id, username, role, access_scope, script_execution_scope, is_script from users where id != $1 order by username;",
      [user_id],
    );

    res.status(200).json({
      data: users.rows,
    });
  },
);

export const display_me = CatchAsync(
  async (
    req: auth_request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const user_id = req.user.user_id;

    const users = await pool.query(
      "select id, username, role, script_execution_scope from users where id = $1;",
      [user_id],
    );

    res.status(200).json({
      data: users.rows,
    });
  },
);

export const set_permissions = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requested_role: string = req.body.role;

    const requested_user_id = req.params.id;

    const modified_user = await pool.query(
      "update users set role = $1 where id = $2 returning username;",
      [requested_role, requested_user_id],
    );

    res.status(200).json({
      data: `role has been updated for user ${modified_user.rows[0].username}`,
    });
  },
);

export const delete_user = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requested_user_id = req.params.id;

    const deleted_user = await pool.query(
      "delete from users where id = $1 returning username;",
      [requested_user_id],
    );

    res.status(204).json({
      data: `user ${deleted_user.rows[0].username} has been deleted successfully`,
    });
  },
);

export const delete_user_entity_access = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requested_entity_id = req.params.id;

    const deleted_user_entity_access = await pool.query(
      "delete from user_entity_access where id = $1 returning *;",
      [requested_entity_id],
    );

    res.status(204).json({
      data: deleted_user_entity_access.rows,
    });
  },
);

export const attach_user_entity_access = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.body.user_id;
    const entity_type = req.body.entity_type;
    const entity_id = req.params.id;

    let column;

    if (entity_type !== "system" && entity_type != "service") {
      return next(new AppError("Invalid entity type", 403));
    }

    if (entity_type === "system") {
      column = "system_id";
    } else if (entity_type === "service") {
      column = "service_id";
    }

    const inserted_entity = await pool.query(
      `insert into user_entity_access (user_id, ${column}) values ($1, $2) returning *;`,
      [user_id, entity_id],
    );

    res.status(201).json({
      data: inserted_entity.rows,
    });
  },
);

export const set_access_scope = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requested_access_scope: string = req.body.access_scope;

    const requested_user_id = req.params.id;

    const modified_user = await pool.query(
      "update users set access_scope = $1 where id = $2 returning username;",
      [requested_access_scope, requested_user_id],
    );

    res.status(200).json({
      data: `access_scope has been updated for user ${modified_user.rows[0].username}`,
    });
  },
);

export const get_attached_entities = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.params.id;

    const attached_entities = await pool.query(
      `
        with attached_entities as (
        
          select id, 'system' as entity_type, system_info.system_id as entity_id,
          system_info.system_name as entity_name from user_entity_access
          inner join system_info on system_info.system_id  = user_entity_access.system_id
          where user_id = $1
          
          union all 

          select id, 'service' as entity_type, service_info.service_id as entity_id,
          service_info.service_name as entity_name from user_entity_access
          inner join service_info on service_info.service_id = user_entity_access.service_id
          where user_id = $1
          
        ) select * from attached_entities;
      `,
      [user_id],
    );

    res.status(200).json({
      data: attached_entities.rows,
    });
  },
);

export const display_user_logs = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.params.id;

    const page = parseInt(req.query.page as string);
    const page_size = parseInt(req.query.page_size as string);
    const offset = (page - 1) * page_size;

    const user_logs = await pool.query(
      `
          select logs.id, users.username, users.role, users.access_scope,
          logs.action, logs.route, logs.status_code, logs.created_at, logs.body
          from logs
          inner join users on logs.user_id = users.id
          where user_id  = $1 and route not ILIKE '%logs%'
          order by created_at desc limit $2 offset $3;
      `,
      [user_id, page_size, offset],
    );

    res.status(200).json({
      data: user_logs.rows,
    });
  },
);

export const attach_user_script_access = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.body.user_id;
    const script_type = req.body.script_type;
    const script_id = req.params.id;

    let column;

    if (script_type !== "system" && script_type != "service") {
      return next(new AppError("Invalid script type", 403));
    }

    if (script_type === "system") {
      column = "system_script_id";
    } else if (script_type === "service") {
      column = "service_script_id";
    }

    const inserted_script = await pool.query(
      `insert into user_script_access (user_id, ${column}) values ($1, $2) returning *;`,
      [user_id, script_id],
    );

    res.status(201).json({
      data: inserted_script.rows,
    });
  },
);

export const set_script_scope = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requested_script_execution_scope: string =
      req.body.script_execution_scope;

    const requested_user_id = req.params.id;

    const modified_user = await pool.query(
      "update users set script_execution_scope = $1 where id = $2 returning username;",
      [requested_script_execution_scope, requested_user_id],
    );

    res.status(200).json({
      data: `script_execution_scope has been updated for user ${modified_user.rows[0].username}`,
    });
  },
);

export const delete_user_script_access = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requested_script_id = req.params.id;

    const deleted_user_script_access = await pool.query(
      "delete from user_script_access where id = $1 returning *;",
      [requested_script_id],
    );

    res.status(204).json({
      data: deleted_user_script_access.rows,
    });
  },
);

export const get_attached_scripts = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.params.id;

    const attached_scripts = await pool.query(
      `
      with attached_scripts as (

        select user_script_access.id, system_scripts.title, 'system' as type from user_script_access
        inner join system_scripts on user_script_access.system_script_id = system_scripts.id
        where user_id = $1
        
        union all 
        
        select user_script_access.id, service_scripts.title, 'service' as type from user_script_access
        inner join service_scripts on user_script_access.service_script_id = service_scripts.id
        where user_id = $1
        
      ) select * from attached_scripts;
      `,
      [user_id],
    );

    res.status(200).json({
      data: attached_scripts.rows,
    });
  },
);

export const get_specific_user = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.params.id;

    const user = await pool.query(
      "select id, username, role, access_scope, script_execution_scope from users where id = $1;",
      [user_id],
    );

    res.status(200).json({
      data: user.rows[0],
    });
  },
);

export const display_me_scripts = CatchAsync(
  async (
    req: auth_request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const user_id = req.user.user_id;
    const script_execution_scope = req.user.user_script_execution_scope;

    let data;

    if (script_execution_scope === "total") {
      data = await pool.query(`
        with scripts as ( 

          select id, title, 'system' as type, description, filename, system_name as entity_name, system_id as entity_id from system_scripts
          inner join system_info on system_scripts.system_parent = system_info.system_id
          
          union all
          
          select id, title, 'service' as type, description, filename, service_name as entity_name, service_id as entity_id from service_scripts
          inner join service_info on service_scripts.service_parent  = service_info.service_id 
          
        ) select * from scripts;
    `);
    } else {
      data = await pool.query(
        `
        with attached_scripts as (

          select system_scripts.id, system_scripts.title,'system' as type, description, filename, system_name as entity_name, system_id as entity_id from user_script_access
          inner join system_scripts on user_script_access.system_script_id = system_scripts.id
          inner join system_info on system_scripts.system_parent = system_info.system_id
          where user_id = $1

          
          union all 
          
          select service_scripts.id, service_scripts.title, 'service' as type, description, filename, service_name as entity_name, service_id as entity_id from user_script_access
          inner join service_scripts on user_script_access.service_script_id = service_scripts.id
          inner join service_info on service_scripts.service_parent  = service_info.service_id
          where user_id = $1

        
      ) select * from attached_scripts;
      `,
        [user_id],
      );
    }

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const update_user_is_script = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user_id = req.params.id;
    const is_script = req.body.is_script;

    const data = await pool.query(
      "update users set is_script = $1 where id = $2 returning username, is_script;",
      [is_script, user_id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);
