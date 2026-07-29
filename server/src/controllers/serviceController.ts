import { Request, Response, NextFunction } from "express";
import pool from "../database/database";
import { CatchAsync } from "../utils/CatchAsync";
import AppError from "../utils/AppError";
import s3Client, { bucket } from "../utils/S3_Client";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as XLSX from "xlsx";
import { runRemoteScript } from "../utils/RemoteScript";
import { service_file } from "../interfaces/files";
import { PublishDocumentEvent } from "../utils/PublishEvent";

export const services = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const services_list = await pool.query("select * from service_info;");

    res.status(200).json({
      data: services_list.rows,
    });
  },
);

export const specific_service = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;
    const selected_service = await pool.query(
      "select * from service_info where service_id = $1",
      [id],
    );

    res.status(200).json({
      data: selected_service.rows,
    });
  },
);

export const services_menu = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const services_menu_list = await pool.query(
      "select service_id, service_name from service_info where service_name is not null;",
    );

    res.status(200).json({
      data: services_menu_list.rows,
    });
  },
);

export const service_dependencies = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;

    const service_dependencies_list = await pool.query(
      "select * from service_dependencies where service_parent = $1",
      [id],
    );

    res.status(200).json({
      data: service_dependencies_list.rows,
    });
  },
);

export const service_virtual_machines = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;

    const site = req.query.site;

    if (site) {
      const system_virtual_machines_list = await pool.query(
        "select * from service_virtual_machines where service_parent = $1 and site_location = $2",
        [id, site],
      );

      if (system_virtual_machines_list.rows.length === 0) {
        return next(
          new AppError("No virtual machines were found for this site", 400),
        );
      }

      res.status(200).json({
        data: system_virtual_machines_list.rows,
      });

      return;
    }

    const service_virtual_machines_list = await pool.query(
      "select * from service_virtual_machines where service_parent = $1",
      [id],
    );

    res.status(200).json({
      data: service_virtual_machines_list.rows,
    });
  },
);

// * fields related 1
export const insert_service = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      service_name,
      impact,
      core_network,
      masad,
      secondary_site,
      backup_type,
      info,
      third_site,
      environment,
      cert_infrastructure,
      owned_by,
      preferred_site,
    } = req.body;

    const created_service = await pool.query(
      `insert into service_info (
        service_name,
        impact,
        core_network,
        masad,
        secondary_site,
        backup_type,
        info,
        third_site,
        environment,
        cert_infrastructure,
        owned_by,
        preferred_site
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      ) returning *`,
      [
        service_name,
        impact,
        core_network,
        masad,
        secondary_site,
        backup_type,
        info,
        third_site,
        environment,
        cert_infrastructure,
        owned_by,
        preferred_site,
      ],
    );

    res.status(201).json({ data: created_service.rows });
  },
);

export const insert_service_dependencies = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;
    const dependency: string = req.body.dependency;

    const created_service_dependency = await pool.query(
      "insert into service_dependencies (service_parent, dependency) values ($1, trim($2)) returning *",
      [id, dependency],
    );

    res.status(201).json({
      data: created_service_dependency.rows,
    });
  },
);
// * servers related v1
export const insert_service_virtual_machines = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;

    const title: string = req.body.title;
    const site_location: string = req.body.site_location;
    const network: string = req.body.network;
    const type: string = req.body.type;
    const cluster: string = req.body.cluster;
    const host: string = req.body.host;
    const ip: string = req.body.ip;
    const room: string = req.body.room;
    const rack: string = req.body.rack;

    const service_dependencies_list = await pool.query(
      "insert into service_virtual_machines (service_parent, title, site_location, network, type, cluster, host, ip, room, rack) values ($1, trim($2), trim($3), trim($4), trim($5), trim($6), trim($7), trim($8), trim($9), trim($10)) returning *",
      [id, title, site_location, network, type, cluster, host, ip, room, rack],
    );

    res.status(200).json({
      data: service_dependencies_list.rows,
    });
  },
);

// ! update services

export const update_service_dependencies = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dependency: string = req.body.dependency;

    const id: number | string = req.params.id;

    const updated_system_dependencies = await pool.query(
      "update service_dependencies set dependency = trim($1) where id = $2 returning *",
      [dependency, id],
    );

    res.status(200).json({
      data: updated_system_dependencies.rows,
    });
  },
);
// * servers related v2
export const update_service_virtual_machine = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;
    const title: string = req.body.title;
    const site_location: string = req.body.site_location;
    const network: string = req.body.network;
    const type: string = req.body.type;
    const cluster: string = req.body.cluster;
    const host: string = req.body.host;
    const ip: string = req.body.ip;
    const room: string = req.body.room;
    const rack: string = req.body.rack;

    if (title && !site_location && !network && !type && !cluster) {
      const updated_service_virtual_machine = await pool.query(
        "update service_virtual_machines set title = $1 where id = $2 returning *",
        [title, id],
      );

      res.status(200).json({
        data: updated_service_virtual_machine.rows,
      });

      return;
    }

    if (site_location && !title && !network && !type && !cluster) {
      const updated_service_virtual_machine = await pool.query(
        "update service_virtual_machines set site_location = $1 where id = $2 returning *",
        [site_location, id],
      );

      res.status(200).json({
        data: updated_service_virtual_machine.rows,
      });

      return;
    }

    if (network && !title && !site_location && !type && !cluster) {
      const updated_service_virtual_machine = await pool.query(
        "update service_virtual_machines set network = $1 where id = $2 returning *",
        [network, id],
      );

      res.status(200).json({
        data: updated_service_virtual_machine.rows,
      });

      return;
    }

    if (type && !title && !site_location && !network && !cluster) {
      const updated_service_virtual_machine = await pool.query(
        "update service_virtual_machines set type = $1 where id = $2 returning *",
        [type, id],
      );

      res.status(200).json({
        data: updated_service_virtual_machine.rows,
      });

      return;
    }

    if (cluster && !title && !site_location && !network && !type) {
      const updated_service_virtual_machine = await pool.query(
        "update service_virtual_machines set cluster = $1 where id = $2 returning *",
        [cluster, id],
      );

      res.status(200).json({
        data: updated_service_virtual_machine.rows,
      });

      return;
    }

    if (!title && !site_location && !network && !type && !cluster) {
      return next(
        new AppError(
          "please specify title or site_location, or network, or type or cluster",
          400,
        ),
      );
    }

    const updated_system_virtual_machine = await pool.query(
      "update service_virtual_machines set title = trim($1), site_location = trim($2), network = trim($3), type = trim($4), cluster = trim($5), host = trim($6), ip = trim($7), room = trim($8), rack = trim($9) where id = $10 returning *",
      [title, site_location, network, type, cluster, host, ip, room, rack, id],
    );

    res.status(200).json({
      data: updated_system_virtual_machine.rows,
    });
  },
);

// * fields related 2
export const update_service = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;
    const {
      service_name,
      impact,
      core_network,
      masad,
      secondary_site,
      backup_type,
      active_location,
      info,
      third_site,
      environment,
      cert_infrastructure,
      owned_by,
      preferred_site,
    } = req.body;

    if (service_name) {
      const updated_service = await pool.query(
        "UPDATE service_info SET service_name = trim($1) WHERE service_id = $2 RETURNING *",
        [service_name, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (impact) {
      const updated_service = await pool.query(
        "UPDATE service_info SET impact = trim($1) WHERE service_id = $2 RETURNING *",
        [impact, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (core_network) {
      const updated_service = await pool.query(
        "UPDATE service_info SET core_network = trim($1) WHERE service_id = $2 RETURNING *",
        [core_network, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (masad) {
      const updated_service = await pool.query(
        "UPDATE service_info SET masad = trim($1) WHERE service_id = $2 RETURNING *",
        [masad, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (secondary_site) {
      const updated_service = await pool.query(
        "UPDATE service_info SET secondary_site = trim($1) WHERE service_id = $2 RETURNING *",
        [secondary_site, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (backup_type) {
      const updated_service = await pool.query(
        "UPDATE service_info SET backup_type = trim($1) WHERE service_id = $2 RETURNING *",
        [backup_type, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (active_location) {
      const updated_service = await pool.query(
        "UPDATE service_info SET active_location = trim($1) WHERE service_id = $2 RETURNING *",
        [active_location, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (info) {
      const updated_service = await pool.query(
        "UPDATE service_info SET info = trim($1) WHERE service_id = $2 RETURNING *",
        [info, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (third_site) {
      const updated_service = await pool.query(
        "UPDATE service_info SET third_site = trim($1) WHERE service_id = $2 RETURNING *",
        [third_site, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (environment) {
      const updated_service = await pool.query(
        "UPDATE service_info SET environment = trim($1) WHERE service_id = $2 RETURNING *",
        [environment, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (cert_infrastructure) {
      const updated_service = await pool.query(
        "UPDATE service_info SET cert_infrastructure = trim($1) WHERE service_id = $2 RETURNING *",
        [cert_infrastructure, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (owned_by) {
      const updated_service = await pool.query(
        "UPDATE service_info SET owned_by = trim($1) WHERE service_id = $2 RETURNING *",
        [owned_by, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    if (preferred_site) {
      const updated_service = await pool.query(
        "UPDATE service_info SET preferred_site = trim($1) WHERE service_id = $2 RETURNING *",
        [preferred_site, id],
      );
      res.status(200).json({
        data: updated_service.rows,
      });
      return;
    }

    return next(
      new AppError("Please provide at least one field to update", 400),
    );
  },
);

// * fields related 3
export const update_service_total = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id: number | string = req.params.id;
    const {
      service_name,
      impact,
      core_network,
      masad,
      secondary_site,
      backup_type,
      active_location,
      info,
      third_site,
      environment,
      cert_infrastructure,
      owned_by,
      preferred_site,
    } = req.body;

    const updated_service = await pool.query(
      `
    UPDATE service_info SET
      service_name = trim($1),
      impact = trim($2),
      core_network = trim($3),
      masad = trim($4),
      secondary_site = trim($5),
      backup_type = trim($6),
      active_location = trim($7),
      info = trim($8),
      third_site = trim($9),
      environment = trim($10),
      cert_infrastructure = trim($11),
      owned_by = trim($12),
      preferred_site = trim($13)
    WHERE service_id = $14
    RETURNING *
    `,
      [
        service_name,
        impact,
        core_network,
        masad,
        secondary_site,
        backup_type,
        active_location,
        info,
        third_site,
        environment,
        cert_infrastructure,
        owned_by,
        preferred_site,
        id,
      ],
    );

    res.status(200).json({
      data: updated_service.rows,
    });
  },
);

export const service_dep_info = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const dep_info = await pool.query(
      "select * from service_dep_info where service_dep_parent = $1",
      [id],
    );

    res.status(200).json({ data: dep_info.rows });
  },
);

export const insert_service_dep_info = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const dep_parent_id = req.body.dep_parent_id;

    const description = req.body.description;

    const inserted_dep = await pool.query(
      "insert into service_dep_info (service_parent, service_dep_parent, description) values ($1, $2, $3) returning *",
      [id, dep_parent_id, description],
    );

    res.status(201).json({ data: inserted_dep.rows });
  },
);

export const edit_service_dep_info = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const description = req.body.description;

    const modified_dep = await pool.query(
      "update service_dep_info set description = $1 where id = $2 returning *",
      [description, id],
    );

    res.status(200).json({ data: modified_dep.rows });
  },
);

// ! delete

export const delete_service_dep_info = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const deleted_item = await pool.query(
      "delete from service_dep_info where id = $1;",
      [id],
    );

    res.status(204).json({
      data: deleted_item.rows,
    });
  },
);

export const delete_service_dep = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const deleted_item = await pool.query(
      "delete from service_dependencies where id = $1;",
      [id],
    );

    res.status(204).json({
      data: deleted_item.rows,
    });
  },
);

export const delete_service_vm = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const deleted_item = await pool.query(
      "delete from service_virtual_machines where id = $1;",
      [id],
    );

    res.status(204).json({
      data: deleted_item.rows,
    });
  },
);

export const systems_related_to_service = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const related_systems = await pool.query(
      `
        SELECT 
          system_info.system_id, 
          system_info.system_name 
        FROM 
          service_info
        INNER JOIN 
          system_service_relationship ON service_info.service_id = system_service_relationship.service_id
        INNER JOIN 
          system_info ON system_service_relationship.system_id = system_info.system_id
        WHERE 
          service_info.service_id = $1;
      `,
      [id],
    );

    res.status(200).json({
      data: related_systems.rows,
    });
  },
);

export const get_service_links = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const data = await pool.query(
      "select * from service_links where service_parent = $1",
      [id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const create_service_link = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const title = req.body.title;
    const link = req.body.link;

    const data = await pool.query(
      "insert into service_links (service_parent, title, link) values ($1, $2, $3) returning *;",
      [id, title, link],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const update_service_link = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const title = req.body.title;
    const link = req.body.link;

    const data = await pool.query(
      "update service_links set title = $1, link = $2 where id = $3 returning *;",
      [title, link, id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const delete_service_link = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const data = await pool.query("delete from service_links where id = $1;", [
      id,
    ]);

    res.status(204).json({
      data: data.rows,
    });
  },
);

export const create_service_doc = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const title = req.body.title;

    const data = await pool.query(
      "insert into service_docs (service_id, title) values ($1, $2) returning *",
      [id, title],
    );

    res.status(201).json({
      data: data.rows,
    });
  },
);

export const display_service_docs = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const data = await pool.query(
      "select id, service_id, title from service_docs where service_id = $1",
      [id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const update_service_doc = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const content = req.body.content;

    const data = await pool.query(
      "update service_docs set content = $1::jsonb where id = $2 returning *",
      [content, id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const upload_files = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const service_id: string = req.params.id;
    const title: string = req.body.title;

    const params = {
      Bucket: bucket,
      Key: req.file?.originalname,
      Body: req.file?.buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3Client.send(command);

    const result = await pool.query(
      "insert into service_files (service_id, title, filename) values ($1, $2, $3) returning *;",
      [service_id, title, req.file?.originalname],
    );

    const file: service_file = result.rows[0];

    const channel: string = "document_service";

    const type: string = "service";

    if (
      req.file?.mimetype ==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      await PublishDocumentEvent(
        channel,
        file.id,
        file.service_id,
        file.title,
        file.filename,
        type,
      );
    }

    res.status(201).json({
      data: result.rows,
    });
  },
);

export const load_files = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // console.log(req.file);

    const service_id: string = req.params.id;

    const files = await pool.query(
      "select * from service_files where service_id = $1",
      [service_id],
    );

    for (const file of files.rows) {
      const getObjectParams = {
        Bucket: bucket,
        Key: file.filename,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      file.url = url;
    }

    res.status(201).json({
      data: files.rows,
    });
  },
);

export const delete_file = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const file_id: string = req.params.id;

    const service_file = await pool.query(
      "select * from service_files where id = $1",
      [file_id],
    );

    const file_name: string = service_file.rows[0]["filename"];

    const params = {
      Bucket: bucket,
      Key: file_name,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);

    await pool.query("delete from service_files where id = $1", [file_id]);

    res.status(200).json({
      message: "Deleted successfully",
    });
  },
);

export const upload_vm_excel = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const service_id = req.params.id;

    if (!req.file) return next(new AppError("No file uploaded", 400));

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any = XLSX.utils.sheet_to_json(sheet);

    const existing = await pool.query(
      "SELECT title FROM service_virtual_machines WHERE service_parent = $1",
      [service_id],
    );
    const existingTitles = existing.rows.map((r) => r.title.toLowerCase());

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const title = (row.title || "").trim();
      if (!title) continue;

      if (existingTitles.includes(title.toLowerCase())) {
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO service_virtual_machines
       (service_parent, title, site_location, network, type, cluster)
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          service_id,
          title,
          row.site_location || "Unknown",
          row.network || "Unknown",
          row.type || "Unknown",
          row.cluster || "Unknown",
        ],
      );

      existingTitles.push(title.toLowerCase());
      inserted++;
    }

    res.status(201).json({
      message: "Excel processed.",
      inserted,
      skipped,
    });
  },
);

export const service_sites = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;

    const data = await pool.query(
      `
        select active_location as site
        from service_info
        where service_id = $1

        union all

        select secondary_site as site
        from service_info
        where service_id = $1

        union all

        select third_site as site
        from service_info
        where service_id = $1
      `,
      [id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const display_scripts = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;

    const data = await pool.query(
      "select * from service_scripts where service_parent = $1;",
      [id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const create_script = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const filename = req.query.filename;

    const data = await pool.query(
      "insert into service_scripts (service_parent, title, description, filename) values ($1, $2, $3, $4) returning *;",
      [id, title, description, filename],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const execute_script = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;

    const script = await pool.query(
      "select * from service_scripts where id = $1;",
      [id],
    );

    const filename = script.rows[0]["filename"];

    const data = await runRemoteScript(`python3 /home/scripts/${filename}`);

    res.status(200).json({
      data: data.stdout,
    });
  },
);

export const delete_script = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = req.params.id;

    const data = await pool.query(
      "delete from service_scripts where id = $1 returning *;",
      [id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const edit_script = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const service_id = req.body.service_id;
    const title = req.body.title;
    const description = req.body.description;
    const filename = req.body.filename;
    const script_id = req.params.id;

    const data = await pool.query(
      "update service_scripts set service_parent = $1, title = $2, description = $3, filename = $4 where id = $5 returning *;",
      [service_id, title, description, filename, script_id],
    );

    res.status(200).json({
      data: data.rows,
    });
  },
);
