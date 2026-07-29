import { Request, Response, NextFunction } from "express";
import pool from "../database/database";
import { CatchAsync } from "../utils/CatchAsync";
import AppError from "../utils/AppError";
import { ReplaceSignedUrls } from "../utils/UpdateSignedUrl";
import { runRemoteScript } from "../utils/RemoteScript";

export const total_services_and_systems = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const total_services_list = await pool.query(
      "select count(distinct(service_name)) as total_services from service_info;",
    );

    const total_systems_list = await pool.query(
      "select count(distinct(system_name)) as total_systems from system_info;",
    );

    const total_services = Number(total_services_list.rows[0].total_services);
    const total_systems = Number(total_systems_list.rows[0].total_systems);

    res.status(200).json({
      total_services,
      total_systems,
    });
  },
);

export const sytems_virtual_machine_usage = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const filter = req.query.filter;

    const limit = req.query.limit;

    if (filter === "systems" && limit == undefined) {
      const Result = await pool.query(
        `SELECT si.system_name as name, COUNT(svm.id) AS vm_count
         FROM system_info si
         LEFT JOIN system_virtual_machines svm 
         ON si.system_id = svm.system_parent
         WHERE si.system_name IS NOT NULL
         GROUP BY si.system_name;`,
      );
      const total_usage = Result.rows;

      res.status(200).json({
        total_usage,
      });

      return;
    } else if (filter === "services" && limit == undefined) {
      const Result = await pool.query(
        `
          SELECT si.service_name as name, COUNT(svm.id) AS vm_count
          FROM service_info si
          LEFT JOIN service_virtual_machines svm 
          ON si.service_id = svm.service_parent
          WHERE si.service_name IS NOT NULL
          GROUP BY si.service_name;
        `,
      );

      const total_usage = Result.rows;

      res.status(200).json({
        total_usage,
      });

      return;
    }

    if (filter === "systems" && limit != undefined) {
      const Result = await pool.query(
        `WITH cte_virtual_per_system_limited AS (
          SELECT 
            si.system_name AS name, 
            COUNT(svm.id) AS vm_count
          FROM system_info si
          LEFT JOIN system_virtual_machines svm 
            ON si.system_id = svm.system_parent
          WHERE si.system_name IS NOT NULL
          GROUP BY si.system_name
        )
        SELECT * 
        FROM cte_virtual_per_system_limited where trim(name) <> ''
        ORDER BY vm_count DESC 
        LIMIT $1;`,
        [limit],
      );

      const total_usage = Result.rows;

      res.status(200).json({
        total_usage,
      });

      return;
    } else if (filter === "services" && limit != undefined) {
      const Result = await pool.query(
        `
        WITH cte_virtual_per_service_limited AS (
          SELECT 
            si.service_name AS name, 
            COUNT(svm.id) AS vm_count
          FROM service_info si
          LEFT JOIN service_virtual_machines svm 
            ON si.service_id = svm.service_parent
          WHERE si.service_name IS NOT NULL
          GROUP BY si.service_name
        )
        SELECT * 
        FROM cte_virtual_per_service_limited where trim(name) <> ''
        ORDER BY vm_count DESC 
        LIMIT $1;`,
        [limit],
      );

      const total_usage = Result.rows;

      res.status(200).json({
        total_usage,
      });

      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const systems_and_services_menu = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const services_and_systems = await pool.query(`
      SELECT system_name AS name, system_id AS id, 'system' AS type
      FROM system_info
      WHERE system_name IS NOT NULL
      UNION ALL
      SELECT service_name AS name, service_id AS id, 'service' AS type
      FROM service_info
      WHERE service_name IS NOT NULL;
    `);

    res.status(200).json({ data: services_and_systems.rows });
  },
);

export const system_virtual_machine_usage = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const system_vm_usage = await pool.query(
      "select site_location, count(site_location) as vm_count from system_virtual_machines where system_parent = $1 group by site_location;",
      [id],
    );

    res.status(200).json({ data: system_vm_usage.rows });
  },
);

export const service_virtual_machine_usage = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const service_vm_usage = await pool.query(
      "select site_location, count(site_location) as vm_count from service_virtual_machines where service_parent = $1 group by site_location;",
      [id],
    );

    res.status(200).json({ data: service_vm_usage.rows });
  },
);

export const virtual_machines_per_site = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const top_virtual_machines_amount_per_site = await pool.query(`
      WITH virtual_machines_location AS (
        SELECT site_location FROM system_virtual_machines
        UNION ALL
        SELECT site_location FROM service_virtual_machines
      )
      SELECT site_location, COUNT(*) AS vm_count
      FROM virtual_machines_location where trim(site_location) <> ''
      GROUP BY site_location
      ORDER BY vm_count DESC
      LIMIT 5;
    `);

    res.status(200).json({
      data: top_virtual_machines_amount_per_site.rows,
    });
  },
);

export const system_authentication_types = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const auth_types = await pool.query(
      "select authentication_type, count(authentication_type) as count from system_authentication where trim(authentication_type) <> '' group by authentication_type order by count desc limit 5;",
    );

    res.status(200).json({
      data: auth_types.rows,
    });
  },
);

export const certificate_infrastructure_types = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cert_types = await pool.query(
      `
      WITH certificates AS (
        SELECT cert_infrastructure FROM service_info
        UNION ALL
        SELECT cert_infrastructure FROM system_info
      )
      SELECT cert_infrastructure, COUNT(cert_infrastructure) AS count 
      FROM certificates where trim(cert_infrastructure) <> ''
      GROUP BY cert_infrastructure 
      ORDER BY count DESC limit 5;
      `,
    );

    res.status(200).json({
      data: cert_types.rows,
    });
  },
);

export const core_network_types = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const network_types = await pool.query(
      `
      WITH networks AS (
        SELECT core_network FROM system_info
        UNION ALL
        SELECT core_network FROM service_info
      )
      SELECT core_network, COUNT(core_network) AS count 
      FROM networks where trim(core_network) <> ''
      GROUP BY core_network 
      ORDER BY count DESC limit 5;
      `,
    );

    res.status(200).json({
      data: network_types.rows,
    });
  },
);

export const system_infrastructure_type = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const infrastructure_types = await pool.query(
      "select infrastructure_type, count(infrastructure_type) as count from system_info where trim(infrastructure_type) <> '' group by infrastructure_type order by count desc limit 5;",
    );

    res.status(200).json({
      data: infrastructure_types.rows,
    });
  },
);
// * fields related 1
export const filtered_systems_and_services = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowedFields = [
      "type",
      "id",
      "name",
      "impact",
      "owned_by",
      "core_network",
      "masad",
      "secondary_site",
      "backup_type",
      "infrastructure_type",
      "authentication",
      "vm_title",
      "vm_location",
      "vm_network",
      "vm_type",
      "vm_cluster",
      "vm_host",
      "vm_ip",
      "vm_room",
      "vm_rack",
      "dependency",
      "active_location",
      "info",
      "third_site",
      "environment",
      "cert_infrastructure",
    ];

    const field = req.query.field as string;
    const value = req.query.value as string;

    if (!allowedFields.includes(field)) {
      return next(new AppError("Invalid filter field", 400));
    }

    const query = `
      WITH systems_and_services AS ( 
        SELECT 
         'system' AS type,
          system_info.system_id AS id,
          system_info.system_name AS name,
          system_info.impact,
          system_info.owned_by,
          system_info.core_network,
          system_info.active_location,
          system_info.masad,
          system_info.info,
          system_info.third_site,
          system_info.environment,
          system_info.cert_infrastructure,
          system_info.secondary_site,
          system_info.backup_type,
          infrastructure_type,
          system_authentication.authentication_type AS authentication,
          system_virtual_machines.title AS vm_title,
          system_virtual_machines.site_location AS vm_location,
          system_virtual_machines.network AS vm_network,
          system_virtual_machines.type AS vm_type,
          system_virtual_machines.cluster AS vm_cluster,
          system_virtual_machines.host AS vm_host,
          system_virtual_machines.ip AS vm_ip,
          system_virtual_machines.room AS vm_room,
          system_virtual_machines.rack AS vm_rack,
          system_dependencies.dependency
        FROM system_info
        LEFT JOIN system_authentication ON system_info.system_id = system_authentication.system_parent
        LEFT JOIN system_virtual_machines ON system_info.system_id = system_virtual_machines.system_parent
        LEFT JOIN system_dependencies ON system_info.system_id = system_dependencies.system_parent

        UNION ALL

        SELECT 
         'service' AS type,
          service_id AS id,
          service_name AS name,
          impact,
          owned_by,
          core_network,
          active_location,
          masad,
          info,
          third_site,
          environment,
          cert_infrastructure,
          secondary_site,
          backup_type,
          NULL AS infrastructure_type,
          NULL AS authentication,
          service_virtual_machines.title AS vm_title,
          service_virtual_machines.site_location AS vm_location,
          service_virtual_machines.network AS vm_network,
          service_virtual_machines.type AS vm_type,
          service_virtual_machines.cluster AS vm_cluster,
          service_virtual_machines.host AS vm_host,
          service_virtual_machines.ip AS vm_ip,
          service_virtual_machines.room AS vm_room,
          service_virtual_machines.rack AS vm_rack,
          service_dependencies.dependency
        FROM service_info
        LEFT JOIN service_virtual_machines ON service_info.service_id = service_virtual_machines.service_parent
        LEFT JOIN service_dependencies ON service_info.service_id = service_dependencies.service_parent
      )
      SELECT distinct(name), type, id
      FROM systems_and_services 
      WHERE ${field} ILIKE $1;
    `;

    const filtered_result = await pool.query(query, [`%${value}%`]);

    res.status(200).json({ data: filtered_result.rows });
  },
);
// * tree architecture
export const tree_diagram = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    let currentId = 100000;
    const generateId = () => currentId++;

    if (type === "system") {
      let system_tree: any[] = [];

      const system_info = await pool.query(
        `SELECT system_id AS id, system_name AS name FROM system_info WHERE system_id = $1`,
        [id],
      );

      if (system_info.rowCount === 0) {
        return next(new AppError("System not found", 404));
      }

      const system = system_info.rows[0];
      const systemId = system.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const authId = generateId();

      const starter_tree = [
        {
          id: systemId,
          name: system.name,
          parent: null,
          type: "system",
        },
        {
          id: serversId,
          name: "servers",
          parent: systemId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: systemId,
          type: "dependency",
        },
        {
          id: authId,
          name: "authentication",
          parent: systemId,
          type: "auth",
        },
      ];

      system_tree.push(...starter_tree);

      const system_dependencies = await pool.query(
        `SELECT dependency AS name FROM system_dependencies WHERE system_parent = $1`,
        [id],
      );

      const dependencies_tree = system_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      system_tree.push(...dependencies_tree);

      const system_authentication = await pool.query(
        `SELECT authentication_type AS name FROM system_authentication WHERE system_parent = $1`,
        [id],
      );

      const auth_tree = system_authentication.rows.map((auth) => ({
        id: generateId(),
        name: auth.name,
        parent: authId,
        type: "auth",
      }));

      system_tree.push(...auth_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT ON (site_location) site_location AS name, id 
         FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const locationNameToId = new Map<string, number>();

      const server_tree = server_locations.rows.map((loc) => {
        const locId = generateId();
        locationNameToId.set(loc.name, locId);
        return {
          id: locId,
          name: loc.name,
          parent: serversId,
          type: "server_location",
        };
      });

      system_tree.push(...server_tree);

      const virtual_machines = await pool.query(
        `SELECT title AS name, site_location AS location 
         FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => ({
        id: generateId(),
        name: vm.name,
        parent: locationNameToId.get(vm.location),
        type: "server",
      }));

      system_tree.push(...vm_tree);

      res.status(200).json({ data: system_tree });
      return;
    } else if (type === "service") {
      let service_tree: any[] = [];

      const service_info = await pool.query(
        `SELECT service_id AS id, service_name AS name FROM service_info WHERE service_id = $1`,
        [id],
      );

      if (service_info.rowCount === 0) {
        return next(new AppError("Service not found", 404));
      }

      const service = service_info.rows[0];
      const serviceId = service.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const systemsId = generateId();

      const starter_tree = [
        {
          id: serviceId,
          name: service.name,
          parent: null,
          type: "service",
        },
        {
          id: serversId,
          name: "servers",
          parent: serviceId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: serviceId,
          type: "dependency",
        },
        {
          id: systemsId,
          name: "systems",
          parent: serviceId,
          type: "system",
        },
      ];

      service_tree.push(...starter_tree);

      const service_dependencies = await pool.query(
        `SELECT dependency AS name FROM service_dependencies WHERE service_parent = $1`,
        [id],
      );

      const dependencies_tree = service_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      service_tree.push(...dependencies_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT ON (site_location) site_location AS name, id 
         FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const locationNameToId = new Map<string, number>();

      const server_tree = server_locations.rows.map((loc) => {
        const locId = generateId();
        locationNameToId.set(loc.name, locId);
        return {
          id: locId,
          name: loc.name,
          parent: serversId,
          type: "server_location",
        };
      });

      service_tree.push(...server_tree);

      const virtual_machines = await pool.query(
        `SELECT title AS name, site_location AS location 
         FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => ({
        id: generateId(),
        name: vm.name,
        parent: locationNameToId.get(vm.location),
        type: "server",
      }));

      service_tree.push(...vm_tree);

      const related_systems = await pool.query(
        ` SELECT 
          system_info.system_name as name
        FROM 
          service_info
        INNER JOIN 
          system_service_relationship ON service_info.service_id = system_service_relationship.service_id
        INNER JOIN 
          system_info ON system_service_relationship.system_id = system_info.system_id
        WHERE 
          service_info.service_id = $1;`,
        [id],
      );

      const related_systems_tree = related_systems.rows.map((system) => ({
        id: generateId(),
        name: system.name,
        parent: systemsId,
        type: "system",
      }));

      service_tree.push(...related_systems_tree);

      res.status(200).json({ data: service_tree });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const tree_diagram_stats = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    let currentId = 100000;
    const generateId = () => currentId++;

    if (type === "system") {
      let system_tree: any[] = [];

      const system_info = await pool.query(
        `SELECT system_id AS id, system_name AS name FROM system_info WHERE system_id = $1`,
        [id],
      );

      if (system_info.rowCount === 0) {
        return next(new AppError("System not found", 404));
      }

      const system = system_info.rows[0];
      const systemId = system.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const authId = generateId();

      const starter_tree = [
        {
          id: systemId,
          name: system.name,
          parent: null,
          type: "system",
        },
        {
          id: serversId,
          name: "servers",
          parent: systemId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: systemId,
          type: "dependency",
        },
        {
          id: authId,
          name: "authentication",
          parent: systemId,
          type: "auth",
        },
      ];

      system_tree.push(...starter_tree);

      const system_dependencies = await pool.query(
        `SELECT count(dependency) AS name FROM system_dependencies WHERE system_parent = $1`,
        [id],
      );

      const dependencies_tree = system_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      system_tree.push(...dependencies_tree);

      const system_authentication = await pool.query(
        `SELECT count(authentication_type) AS name FROM system_authentication WHERE system_parent = $1`,
        [id],
      );

      const auth_tree = system_authentication.rows.map((auth) => ({
        id: generateId(),
        name: auth.name,
        parent: authId,
        type: "auth",
      }));

      system_tree.push(...auth_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT ON (site_location) site_location AS name, id 
         FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const locationNameToId = new Map<string, number>();

      const server_tree = server_locations.rows.map((loc) => {
        const locId = generateId();
        locationNameToId.set(loc.name, locId);
        return {
          id: locId,
          name: loc.name,
          parent: serversId,
          type: "server_location",
        };
      });

      system_tree.push(...server_tree);

      const virtual_machines = await pool.query(
        `SELECT count(title) AS name, site_location AS location 
         FROM system_virtual_machines WHERE system_parent = $1 group by site_location`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => ({
        id: generateId(),
        name: vm.name,
        parent: locationNameToId.get(vm.location),
        type: "server",
      }));

      system_tree.push(...vm_tree);

      res.status(200).json({ data: system_tree });
      return;
    } else if (type === "service") {
      let service_tree: any[] = [];

      const service_info = await pool.query(
        `SELECT service_id AS id, service_name AS name FROM service_info WHERE service_id = $1`,
        [id],
      );

      if (service_info.rowCount === 0) {
        return next(new AppError("Service not found", 404));
      }

      const service = service_info.rows[0];
      const serviceId = service.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const systemsId = generateId();

      const starter_tree = [
        {
          id: serviceId,
          name: service.name,
          parent: null,
          type: "service",
        },
        {
          id: serversId,
          name: "servers",
          parent: serviceId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: serviceId,
          type: "dependency",
        },
        {
          id: systemsId,
          name: "systems",
          parent: serviceId,
          type: "system",
        },
      ];

      service_tree.push(...starter_tree);

      const service_dependencies = await pool.query(
        `SELECT count(dependency) AS name FROM service_dependencies WHERE service_parent = $1`,
        [id],
      );

      const dependencies_tree = service_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      service_tree.push(...dependencies_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT ON (site_location) site_location AS name, id 
         FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const locationNameToId = new Map<string, number>();

      const server_tree = server_locations.rows.map((loc) => {
        const locId = generateId();
        locationNameToId.set(loc.name, locId);
        return {
          id: locId,
          name: loc.name,
          parent: serversId,
          type: "server_location",
        };
      });

      service_tree.push(...server_tree);

      const virtual_machines = await pool.query(
        `SELECT count(title) AS name, site_location AS location 
         FROM service_virtual_machines WHERE service_parent = $1 group by site_location`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => ({
        id: generateId(),
        name: vm.name,
        parent: locationNameToId.get(vm.location),
        type: "server",
      }));

      service_tree.push(...vm_tree);

      const related_systems = await pool.query(
        ` SELECT 
          count(system_info.system_name) as name
        FROM 
          service_info
        INNER JOIN 
          system_service_relationship ON service_info.service_id = system_service_relationship.service_id
        INNER JOIN 
          system_info ON system_service_relationship.system_id = system_info.system_id
        WHERE 
          service_info.service_id = $1;`,
        [id],
      );

      const related_systems_tree = related_systems.rows.map((system) => ({
        id: generateId(),
        name: system.name,
        parent: systemsId,
        type: "system",
      }));

      service_tree.push(...related_systems_tree);

      res.status(200).json({ data: service_tree });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const tree_diagram_custom = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    let currentId = 100000;
    const generateId = () => currentId++;

    if (type === "system") {
      let system_tree: any[] = [];

      const system_info = await pool.query(
        `SELECT system_id AS id, system_name AS name FROM system_info WHERE system_id = $1`,
        [id],
      );

      if (system_info.rowCount === 0) {
        return next(new AppError("System not found", 404));
      }

      const system = system_info.rows[0];
      const systemId = system.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const authId = generateId();

      const starter_tree = [
        {
          id: systemId,
          name: system.name,
          parent: null,
          type: "system",
        },
        {
          id: serversId,
          name: "servers",
          parent: systemId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: systemId,
          type: "dependency",
        },
        {
          id: authId,
          name: "authentication",
          parent: systemId,
          type: "auth",
        },
      ];

      system_tree.push(...starter_tree);

      const system_dependencies = await pool.query(
        `SELECT dependency AS name FROM system_dependencies WHERE system_parent = $1`,
        [id],
      );

      const dependencies_tree = system_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      system_tree.push(...dependencies_tree);

      const system_authentication = await pool.query(
        `SELECT authentication_type AS name FROM system_authentication WHERE system_parent = $1`,
        [id],
      );

      const auth_tree = system_authentication.rows.map((auth) => ({
        id: generateId(),
        name: auth.name,
        parent: authId,
        type: "auth",
      }));

      system_tree.push(...auth_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT ON (site_location) site_location AS name, id 
         FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const locationNameToId = new Map<string, number>();

      const server_tree = server_locations.rows.map((loc) => {
        const locId = generateId();
        locationNameToId.set(loc.name, locId);
        return {
          id: locId,
          name: loc.name,
          parent: serversId,
          type: "server_location",
        };
      });

      system_tree.push(...server_tree);

      const virtual_machines = await pool.query(
        `SELECT count(title) AS name, site_location AS location 
         FROM system_virtual_machines WHERE system_parent = $1 group by site_location`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => ({
        id: generateId(),
        name: vm.name,
        parent: locationNameToId.get(vm.location),
        type: "server",
      }));

      system_tree.push(...vm_tree);

      res.status(200).json({ data: system_tree });
      return;
    } else if (type === "service") {
      let service_tree: any[] = [];

      const service_info = await pool.query(
        `SELECT service_id AS id, service_name AS name FROM service_info WHERE service_id = $1`,
        [id],
      );

      if (service_info.rowCount === 0) {
        return next(new AppError("Service not found", 404));
      }

      const service = service_info.rows[0];
      const serviceId = service.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const systemsId = generateId();

      const starter_tree = [
        {
          id: serviceId,
          name: service.name,
          parent: null,
          type: "service",
        },
        {
          id: serversId,
          name: "servers",
          parent: serviceId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: serviceId,
          type: "dependency",
        },
        {
          id: systemsId,
          name: "systems",
          parent: serviceId,
          type: "system",
        },
      ];

      service_tree.push(...starter_tree);

      const service_dependencies = await pool.query(
        `SELECT dependency AS name FROM service_dependencies WHERE service_parent = $1`,
        [id],
      );

      const dependencies_tree = service_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      service_tree.push(...dependencies_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT ON (site_location) site_location AS name, id 
         FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const locationNameToId = new Map<string, number>();

      const server_tree = server_locations.rows.map((loc) => {
        const locId = generateId();
        locationNameToId.set(loc.name, locId);
        return {
          id: locId,
          name: loc.name,
          parent: serversId,
          type: "server_location",
        };
      });

      service_tree.push(...server_tree);

      const virtual_machines = await pool.query(
        `SELECT count(title) AS name, site_location AS location 
         FROM service_virtual_machines WHERE service_parent = $1 group by site_location`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => ({
        id: generateId(),
        name: vm.name,
        parent: locationNameToId.get(vm.location),
        type: "server",
      }));

      service_tree.push(...vm_tree);

      const related_systems = await pool.query(
        ` SELECT 
          count(system_info.system_name) as name
        FROM 
          service_info
        INNER JOIN 
          system_service_relationship ON service_info.service_id = system_service_relationship.service_id
        INNER JOIN 
          system_info ON system_service_relationship.system_id = system_info.system_id
        WHERE 
          service_info.service_id = $1
        HAVING 
          COUNT(system_info.system_name) > 0;
       `,
        [id],
      );

      const related_systems_tree = related_systems.rows.map((system) => ({
        id: generateId(),
        name: system.name,
        parent: systemsId,
        type: "system",
      }));

      service_tree.push(...related_systems_tree);

      res.status(200).json({ data: service_tree });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);
// * fields related 2
export const filtered_systems_and_services_advanced = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const type = (req.query.type as string) || "";
    const name = (req.query.name as string) || "";
    const impact = (req.query.impact as string) || "";
    const owned_by = (req.query.owned_by as string) || "";
    const core_network = (req.query.core_network as string) || "";
    const masad = (req.query.masad as string) || "";
    const secondary_site = (req.query.secondary_site as string) || "";
    const backup_type = (req.query.backup_type as string) || "";
    const infrastructure_type = (req.query.infrastructure_type as string) || "";
    const authentication = (req.query.authentication as string) || "";
    const vm_title = (req.query.vm_title as string) || "";
    const vm_location = (req.query.vm_location as string) || "";
    const vm_network = (req.query.vm_network as string) || "";
    const vm_type = (req.query.vm_type as string) || "";
    const vm_cluster = (req.query.vm_cluster as string) || "";
    const vm_host = (req.query.vm_host as string) || "";
    const vm_ip = (req.query.vm_ip as string) || "";
    const vm_room = (req.query.vm_room as string) || "";
    const vm_rack = (req.query.vm_rack as string) || "";
    const dependency = (req.query.dependency as string) || "";
    const info = (req.query.info as string) || "";
    const third_site = (req.query.third_site as string) || "";
    const environment = (req.query.environment as string) || "";
    const cert_infrastructure = (req.query.cert_infrastructure as string) || "";
    const active_location = (req.query.active_location as string) || "";

    const query = `
      WITH systems_and_services AS ( 
        SELECT 
          'system' AS type,
          system_info.system_id AS id,
          system_info.system_name AS name,
          system_info.impact,
          system_info.owned_by,
          system_info.core_network,
          system_info.masad,
          system_info.info,
          system_info.active_location,
          system_info.third_site,
          system_info.environment,
          system_info.cert_infrastructure,
          system_info.secondary_site,
          system_info.backup_type,
          infrastructure_type,
          system_authentication.authentication_type AS authentication,
          system_virtual_machines.title AS vm_title,
          system_virtual_machines.site_location AS vm_location,
          system_virtual_machines.network AS vm_network,
          system_virtual_machines.type AS vm_type,
          system_virtual_machines.cluster AS vm_cluster,
          system_virtual_machines.host AS vm_host,
          system_virtual_machines.ip AS vm_ip,
          system_virtual_machines.room AS vm_room,
          system_virtual_machines.rack AS vm_rack,
          system_dependencies.dependency
        FROM system_info
        LEFT JOIN system_authentication ON system_info.system_id = system_authentication.system_parent
        LEFT JOIN system_virtual_machines ON system_info.system_id = system_virtual_machines.system_parent
        LEFT JOIN system_dependencies ON system_info.system_id = system_dependencies.system_parent

        UNION ALL

        SELECT 
          'service' AS type,
          service_info.service_id AS id,
          service_name AS name,
          impact,
          owned_by,
          core_network,
          masad,
          info,
          active_location,
          third_site,
          environment,
          cert_infrastructure,
          secondary_site,
          backup_type,
          NULL AS infrastructure_type,
          NULL AS authentication,
          service_virtual_machines.title AS vm_title,
          service_virtual_machines.site_location AS vm_location,
          service_virtual_machines.network AS vm_network,
          service_virtual_machines.type AS vm_type,
          service_virtual_machines.cluster AS vm_cluster,
          service_virtual_machines.host AS vm_host,
          service_virtual_machines.ip AS vm_ip,
          service_virtual_machines.room AS vm_room,
          service_virtual_machines.rack AS vm_rack,
          service_dependencies.dependency
        FROM service_info
        LEFT JOIN service_virtual_machines ON service_info.service_id = service_virtual_machines.service_parent
        LEFT JOIN service_dependencies ON service_info.service_id = service_dependencies.service_parent
      )
      SELECT DISTINCT name, type, id
      FROM systems_and_services
      WHERE COALESCE(type, '') ILIKE $1
        AND COALESCE(name, '') ILIKE $2
        AND COALESCE(impact, '') ILIKE $3
        AND COALESCE(owned_by::TEXT, '') ILIKE $4
        AND COALESCE(core_network, '') ILIKE $5
        AND COALESCE(masad, '') ILIKE $6
        AND COALESCE(secondary_site, '') ILIKE $7
        AND COALESCE(backup_type, '') ILIKE $8
        AND COALESCE(infrastructure_type, '') ILIKE $9
        AND COALESCE(authentication, '') ILIKE $10
        AND COALESCE(vm_title, '') ILIKE $11
        AND COALESCE(vm_location, '') ILIKE $12
        AND COALESCE(vm_network, '') ILIKE $13
        AND COALESCE(vm_type, '') ILIKE $14
        AND COALESCE(vm_cluster, '') ILIKE $15
        AND COALESCE(vm_host, '') ILIKE $16
        AND COALESCE(vm_ip, '') ILIKE $17
        AND COALESCE(vm_room, '') ILIKE $18
        AND COALESCE(vm_rack, '') ILIKE $19
        AND COALESCE(dependency, '') ILIKE $20
        AND COALESCE(info, '') ILIKE $21
        AND COALESCE(third_site, '') ILIKE $22
        AND COALESCE(environment, '') ILIKE $23
        AND COALESCE(cert_infrastructure, '') ILIKE $24
        AND COALESCE(active_location, '') ILIKE $25;
    `;

    const filtered_result = await pool.query(query, [
      `%${type}%`,
      `%${name}%`,
      `%${impact}%`,
      `%${owned_by}%`,
      `%${core_network}%`,
      `%${masad}%`,
      `%${secondary_site}%`,
      `%${backup_type}%`,
      `%${infrastructure_type}%`,
      `%${authentication}%`,
      `%${vm_title}%`,
      `%${vm_location}%`,
      `%${vm_network}%`,
      `%${vm_type}%`,
      `%${vm_cluster}%`,
      `%${vm_host}%`,
      `%${vm_ip}%`,
      `%${vm_room}%`,
      `%${vm_rack}%`,
      `%${dependency}%`,
      `%${info}%`,
      `%${third_site}%`,
      `%${environment}%`,
      `%${cert_infrastructure}%`,
      `%${active_location}%`,
    ]);

    res.status(200).json({ data: filtered_result.rows });
  },
);

export const active_systems_and_services_locations = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const locations = await pool.query(`with active_entity_location as (
      select service_id as id, 'service' as type, service_name as name, active_location from service_info
      union all
      select system_id as id, 'system' as type, system_name as name, active_location from system_info
    ) select * from active_entity_location where active_location != 'UnKnown' order by active_location;`);

    res.status(200).json({ data: locations.rows });
  },
);

export const systems_related_to_service_network = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    let network_tree = [];

    let currentId = 100000;
    const generateId = () => currentId++;

    const parent_service = await pool.query(
      "select 'service' as type ,service_id as id, service_name as name, null as parent from service_info where service_id = $1;",
      [id],
    );

    network_tree.push(...parent_service.rows);

    const related_systems = await pool.query(
      `
        SELECT 
         'system' as type,
          system_info.system_id AS id, 
          system_info.system_name AS name,
          service_info.service_id AS parent
        FROM 
          service_info
        INNER JOIN 
          system_service_relationship 
          ON service_info.service_id = system_service_relationship.service_id
        INNER JOIN 
          system_info 
          ON system_service_relationship.system_id = system_info.system_id
        WHERE 
          service_info.service_id = $1;
      `,
      [id],
    );

    const updated_systems = related_systems.rows.map((row) => ({
      ...row,
      id: generateId(),
    }));

    network_tree.push(...updated_systems);

    res.status(200).json({
      data: network_tree,
    });
  },
);

export const tree_diagram_advanced = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    let currentId = 100000;
    const generateId = () => currentId++;

    if (type === "system") {
      let system_tree = [];

      const system_info = await pool.query(
        `SELECT system_id AS id, system_name AS name FROM system_info WHERE system_id = $1`,
        [id],
      );

      if (system_info.rowCount === 0) {
        return next(new AppError("System not found", 404));
      }

      const system = system_info.rows[0];
      const systemId = system.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const authId = generateId();

      const starter_tree = [
        {
          id: systemId,
          name: system.name,
          parent: null,
          type: "system",
        },
        {
          id: serversId,
          name: "servers",
          parent: systemId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: systemId,
          type: "dependency",
        },
        {
          id: authId,
          name: "authentication",
          parent: systemId,
          type: "auth",
        },
      ];

      system_tree.push(...starter_tree);

      const system_dependencies = await pool.query(
        `SELECT dependency AS name FROM system_dependencies WHERE system_parent = $1`,
        [id],
      );

      const dependencies_tree = system_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      system_tree.push(...dependencies_tree);

      const system_authentication = await pool.query(
        `SELECT authentication_type AS name FROM system_authentication WHERE system_parent = $1`,
        [id],
      );

      const auth_tree = system_authentication.rows.map((auth) => ({
        id: generateId(),
        name: auth.name,
        parent: authId,
        type: "auth",
      }));

      system_tree.push(...auth_tree);

      const server_networks = await pool.query(
        `SELECT DISTINCT network AS name FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const networkNameToId = new Map<string, number>();
      const network_tree = server_networks.rows.map((net) => {
        const netId = generateId();
        networkNameToId.set(net.name, netId);
        return {
          id: netId,
          name: net.name,
          parent: serversId,
          type: "server_network",
        };
      });

      system_tree.push(...network_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT site_location AS name, network FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const locationKeyToId = new Map<string, number>();
      const location_tree = server_locations.rows.map((loc) => {
        const key = `${loc.network}-${loc.name}`;
        const locId = generateId();
        locationKeyToId.set(key, locId);
        return {
          id: locId,
          name: loc.name,
          parent: networkNameToId.get(loc.network),
          type: "server_location",
        };
      });

      system_tree.push(...location_tree);

      const server_types = await pool.query(
        `SELECT DISTINCT type, site_location, network FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const typeKeyToId = new Map<string, number>();
      const type_tree = server_types.rows.map((row) => {
        const key = `${row.network}-${row.site_location}-${row.type}`;
        const typeId = generateId();
        typeKeyToId.set(key, typeId);
        const parentKey = `${row.network}-${row.site_location}`;
        return {
          id: typeId,
          name: row.type,
          parent: locationKeyToId.get(parentKey),
          type: "server_type",
        };
      });

      system_tree.push(...type_tree);

      const virtual_machines = await pool.query(
        `SELECT title AS name, type, site_location, network 
         FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => {
        const key = `${vm.network}-${vm.site_location}-${vm.type}`;
        return {
          id: generateId(),
          name: vm.name,
          parent: typeKeyToId.get(key),
          type: "server",
        };
      });

      system_tree.push(...vm_tree);

      res.status(200).json({ data: system_tree });
      return;
    } else if (type === "service") {
      let service_tree = [];

      const service_info = await pool.query(
        `SELECT service_id AS id, service_name AS name FROM service_info WHERE service_id = $1`,
        [id],
      );

      if (service_info.rowCount === 0) {
        return next(new AppError("Service not found", 404));
      }

      const service = service_info.rows[0];
      const serviceId = service.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const systemsId = generateId();

      const starter_tree = [
        {
          id: serviceId,
          name: service.name,
          parent: null,
          type: "service",
        },
        {
          id: serversId,
          name: "servers",
          parent: serviceId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: serviceId,
          type: "dependency",
        },
        {
          id: systemsId,
          name: "systems",
          parent: serviceId,
          type: "system",
        },
      ];

      service_tree.push(...starter_tree);

      const service_dependencies = await pool.query(
        `SELECT dependency AS name FROM service_dependencies WHERE service_parent = $1`,
        [id],
      );

      const dependencies_tree = service_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      service_tree.push(...dependencies_tree);

      const server_networks = await pool.query(
        `SELECT DISTINCT network AS name FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const networkNameToId = new Map<string, number>();
      const network_tree = server_networks.rows.map((net) => {
        const netId = generateId();
        networkNameToId.set(net.name, netId);
        return {
          id: netId,
          name: net.name,
          parent: serversId,
          type: "server_network",
        };
      });

      service_tree.push(...network_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT site_location AS name, network FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const locationKeyToId = new Map<string, number>();
      const location_tree = server_locations.rows.map((loc) => {
        const key = `${loc.network}-${loc.name}`;
        const locId = generateId();
        locationKeyToId.set(key, locId);
        return {
          id: locId,
          name: loc.name,
          parent: networkNameToId.get(loc.network),
          type: "server_location",
        };
      });

      service_tree.push(...location_tree);

      const server_types = await pool.query(
        `SELECT DISTINCT type, site_location, network FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const typeKeyToId = new Map<string, number>();
      const type_tree = server_types.rows.map((row) => {
        const key = `${row.network}-${row.site_location}-${row.type}`;
        const typeId = generateId();
        typeKeyToId.set(key, typeId);
        const parentKey = `${row.network}-${row.site_location}`;
        return {
          id: typeId,
          name: row.type,
          parent: locationKeyToId.get(parentKey),
          type: "server_type",
        };
      });

      service_tree.push(...type_tree);

      const virtual_machines = await pool.query(
        `SELECT title AS name, type, site_location, network 
         FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const vm_tree = virtual_machines.rows.map((vm) => {
        const key = `${vm.network}-${vm.site_location}-${vm.type}`;
        return {
          id: generateId(),
          name: vm.name,
          parent: typeKeyToId.get(key),
          type: "server",
        };
      });

      service_tree.push(...vm_tree);

      const related_systems = await pool.query(
        `SELECT system_info.system_name as name
         FROM service_info
         INNER JOIN system_service_relationship ON service_info.service_id = system_service_relationship.service_id
         INNER JOIN system_info ON system_service_relationship.system_id = system_info.system_id
         WHERE service_info.service_id = $1`,
        [id],
      );

      const related_systems_tree = related_systems.rows.map((system) => ({
        id: generateId(),
        name: system.name,
        parent: systemsId,
        type: "system",
      }));

      service_tree.push(...related_systems_tree);

      res.status(200).json({ data: service_tree });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const tree_diagram_stats_advanced = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    let currentId = 100000;
    const generateId = () => currentId++;

    if (type === "system") {
      let system_tree: any[] = [];

      const system_info = await pool.query(
        `SELECT system_id AS id, system_name AS name FROM system_info WHERE system_id = $1`,
        [id],
      );

      if (system_info.rowCount === 0) {
        return next(new AppError("System not found", 404));
      }

      const system = system_info.rows[0];
      const systemId = system.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const authId = generateId();

      const starter_tree = [
        {
          id: systemId,
          name: system.name,
          parent: null,
          type: "system",
        },
        {
          id: serversId,
          name: "servers",
          parent: systemId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: systemId,
          type: "dependency",
        },
        {
          id: authId,
          name: "authentication",
          parent: systemId,
          type: "auth",
        },
      ];

      system_tree.push(...starter_tree);

      const system_dependencies = await pool.query(
        `SELECT count(dependency) AS name FROM system_dependencies WHERE system_parent = $1`,
        [id],
      );

      const dependencies_tree = system_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      system_tree.push(...dependencies_tree);

      const system_authentication = await pool.query(
        `SELECT count(authentication_type) AS name FROM system_authentication WHERE system_parent = $1`,
        [id],
      );

      const auth_tree = system_authentication.rows.map((auth) => ({
        id: generateId(),
        name: auth.name,
        parent: authId,
        type: "auth",
      }));

      system_tree.push(...auth_tree);

      const server_networks = await pool.query(
        `SELECT DISTINCT network AS name FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const networkNameToId = new Map<string, number>();
      const network_tree = server_networks.rows.map((net) => {
        const netId = generateId();
        networkNameToId.set(net.name, netId);
        return {
          id: netId,
          name: net.name,
          parent: serversId,
          type: "server_network",
        };
      });

      system_tree.push(...network_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT site_location AS name, network FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const locationKeyToId = new Map<string, number>();
      const location_tree = server_locations.rows.map((loc) => {
        const key = `${loc.network}-${loc.name}`;
        const locId = generateId();
        locationKeyToId.set(key, locId);
        return {
          id: locId,
          name: loc.name,
          parent: networkNameToId.get(loc.network),
          type: "server_location",
        };
      });

      system_tree.push(...location_tree);

      const server_types = await pool.query(
        `SELECT DISTINCT type, site_location, network FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const typeKeyToId = new Map<string, number>();
      const type_tree = server_types.rows.map((row) => {
        const key = `${row.network}-${row.site_location}-${row.type}`;
        const typeId = generateId();
        typeKeyToId.set(key, typeId);
        const parentKey = `${row.network}-${row.site_location}`;
        return {
          id: typeId,
          name: row.type,
          parent: locationKeyToId.get(parentKey),
          type: "server_type",
        };
      });

      system_tree.push(...type_tree);

      const server_tree = await pool.query(
        `SELECT COUNT(*) AS count, type, site_location, network 
         FROM system_virtual_machines 
         WHERE system_parent = $1 
         GROUP BY network, site_location, type`,
        [id],
      );

      const server_leaf_nodes = server_tree.rows.map((vm) => {
        const key = `${vm.network}-${vm.site_location}-${vm.type}`;
        return {
          id: generateId(),
          name: vm.count,
          parent: typeKeyToId.get(key),
          type: "server",
        };
      });

      system_tree.push(...server_leaf_nodes);

      res.status(200).json({ data: system_tree });
      return;
    } else if (type === "service") {
      let service_tree: any[] = [];

      const service_info = await pool.query(
        `SELECT service_id AS id, service_name AS name FROM service_info WHERE service_id = $1`,
        [id],
      );

      if (service_info.rowCount === 0) {
        return next(new AppError("Service not found", 404));
      }

      const service = service_info.rows[0];
      const serviceId = service.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const systemsId = generateId();

      const starter_tree = [
        {
          id: serviceId,
          name: service.name,
          parent: null,
          type: "service",
        },
        {
          id: serversId,
          name: "servers",
          parent: serviceId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: serviceId,
          type: "dependency",
        },
        {
          id: systemsId,
          name: "systems",
          parent: serviceId,
          type: "system",
        },
      ];

      service_tree.push(...starter_tree);

      const service_dependencies = await pool.query(
        `SELECT count(dependency) AS name FROM service_dependencies WHERE service_parent = $1`,
        [id],
      );

      const dependencies_tree = service_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      service_tree.push(...dependencies_tree);

      const server_networks = await pool.query(
        `SELECT DISTINCT network AS name FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const networkNameToId = new Map<string, number>();
      const network_tree = server_networks.rows.map((net) => {
        const netId = generateId();
        networkNameToId.set(net.name, netId);
        return {
          id: netId,
          name: net.name,
          parent: serversId,
          type: "server_network",
        };
      });

      service_tree.push(...network_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT site_location AS name, network FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const locationKeyToId = new Map<string, number>();
      const location_tree = server_locations.rows.map((loc) => {
        const key = `${loc.network}-${loc.name}`;
        const locId = generateId();
        locationKeyToId.set(key, locId);
        return {
          id: locId,
          name: loc.name,
          parent: networkNameToId.get(loc.network),
          type: "server_location",
        };
      });

      service_tree.push(...location_tree);

      const server_types = await pool.query(
        `SELECT DISTINCT type, site_location, network FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const typeKeyToId = new Map<string, number>();
      const type_tree = server_types.rows.map((row) => {
        const key = `${row.network}-${row.site_location}-${row.type}`;
        const typeId = generateId();
        typeKeyToId.set(key, typeId);
        const parentKey = `${row.network}-${row.site_location}`;
        return {
          id: typeId,
          name: row.type,
          parent: locationKeyToId.get(parentKey),
          type: "server_type",
        };
      });

      service_tree.push(...type_tree);

      const server_tree = await pool.query(
        `SELECT COUNT(*) AS count, type, site_location, network 
         FROM service_virtual_machines 
         WHERE service_parent = $1 
         GROUP BY network, site_location, type`,
        [id],
      );

      const server_leaf_nodes = server_tree.rows.map((vm) => {
        const key = `${vm.network}-${vm.site_location}-${vm.type}`;
        return {
          id: generateId(),
          name: vm.count,
          parent: typeKeyToId.get(key),
          type: "server",
        };
      });

      service_tree.push(...server_leaf_nodes);

      const related_systems = await pool.query(
        `SELECT COUNT(system_info.system_name) as name
         FROM service_info
         INNER JOIN system_service_relationship ON service_info.service_id = system_service_relationship.service_id
         INNER JOIN system_info ON system_service_relationship.system_id = system_info.system_id
         WHERE service_info.service_id = $1`,
        [id],
      );

      const related_systems_tree = related_systems.rows.map((system) => ({
        id: generateId(),
        name: system.name,
        parent: systemsId,
        type: "system",
      }));

      service_tree.push(...related_systems_tree);

      res.status(200).json({ data: service_tree });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const tree_diagram_custom_advanced = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    let currentId = 100000;
    const generateId = () => currentId++;

    if (type === "system") {
      let system_tree = [];

      const system_info = await pool.query(
        `SELECT system_id AS id, system_name AS name FROM system_info WHERE system_id = $1`,
        [id],
      );

      if (system_info.rowCount === 0) {
        return next(new AppError("System not found", 404));
      }

      const system = system_info.rows[0];
      const systemId = system.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const authId = generateId();

      const starter_tree = [
        {
          id: systemId,
          name: system.name,
          parent: null,
          type: "system",
        },
        {
          id: serversId,
          name: "servers",
          parent: systemId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: systemId,
          type: "dependency",
        },
        {
          id: authId,
          name: "authentication",
          parent: systemId,
          type: "auth",
        },
      ];

      system_tree.push(...starter_tree);

      const system_dependencies = await pool.query(
        `SELECT dependency AS name FROM system_dependencies WHERE system_parent = $1`,
        [id],
      );

      const dependencies_tree = system_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      system_tree.push(...dependencies_tree);

      const system_authentication = await pool.query(
        `SELECT authentication_type AS name FROM system_authentication WHERE system_parent = $1`,
        [id],
      );

      const auth_tree = system_authentication.rows.map((auth) => ({
        id: generateId(),
        name: auth.name,
        parent: authId,
        type: "auth",
      }));

      system_tree.push(...auth_tree);

      const server_networks = await pool.query(
        `SELECT DISTINCT network AS name FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const networkNameToId = new Map<string, number>();
      const network_tree = server_networks.rows.map((net) => {
        const netId = generateId();
        networkNameToId.set(net.name, netId);
        return {
          id: netId,
          name: net.name,
          parent: serversId,
          type: "server_network",
        };
      });

      system_tree.push(...network_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT site_location AS name, network FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const locationKeyToId = new Map<string, number>();
      const location_tree = server_locations.rows.map((loc) => {
        const key = `${loc.network}-${loc.name}`;
        const locId = generateId();
        locationKeyToId.set(key, locId);
        return {
          id: locId,
          name: loc.name,
          parent: networkNameToId.get(loc.network),
          type: "server_location",
        };
      });

      system_tree.push(...location_tree);

      const server_types = await pool.query(
        `SELECT DISTINCT type, site_location, network FROM system_virtual_machines WHERE system_parent = $1`,
        [id],
      );

      const typeKeyToId = new Map<string, number>();
      const type_tree = server_types.rows.map((row) => {
        const key = `${row.network}-${row.site_location}-${row.type}`;
        const typeId = generateId();
        typeKeyToId.set(key, typeId);
        const parentKey = `${row.network}-${row.site_location}`;
        return {
          id: typeId,
          name: row.type,
          parent: locationKeyToId.get(parentKey),
          type: "server_type",
        };
      });

      system_tree.push(...type_tree);

      const server_counts = await pool.query(
        `SELECT COUNT(*) AS count, type, site_location, network 
         FROM system_virtual_machines 
         WHERE system_parent = $1 
         GROUP BY network, site_location, type`,
        [id],
      );

      const server_tree = server_counts.rows.map((vm) => {
        const key = `${vm.network}-${vm.site_location}-${vm.type}`;
        return {
          id: generateId(),
          name: vm.count,
          parent: typeKeyToId.get(key),
          type: "server",
        };
      });

      system_tree.push(...server_tree);

      res.status(200).json({ data: system_tree });
      return;
    } else if (type === "service") {
      let service_tree = [];

      const service_info = await pool.query(
        `SELECT service_id AS id, service_name AS name FROM service_info WHERE service_id = $1`,
        [id],
      );

      if (service_info.rowCount === 0) {
        return next(new AppError("Service not found", 404));
      }

      const service = service_info.rows[0];
      const serviceId = service.id;

      const serversId = generateId();
      const dependenciesId = generateId();
      const systemsId = generateId();

      const starter_tree = [
        {
          id: serviceId,
          name: service.name,
          parent: null,
          type: "service",
        },
        {
          id: serversId,
          name: "servers",
          parent: serviceId,
          type: "servers",
        },
        {
          id: dependenciesId,
          name: "dependencies",
          parent: serviceId,
          type: "dependency",
        },
        {
          id: systemsId,
          name: "systems",
          parent: serviceId,
          type: "system",
        },
      ];

      service_tree.push(...starter_tree);

      const service_dependencies = await pool.query(
        `SELECT dependency AS name FROM service_dependencies WHERE service_parent = $1`,
        [id],
      );

      const dependencies_tree = service_dependencies.rows.map((dep) => ({
        id: generateId(),
        name: dep.name,
        parent: dependenciesId,
        type: "dependency",
      }));

      service_tree.push(...dependencies_tree);

      const server_networks = await pool.query(
        `SELECT DISTINCT network AS name FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const networkNameToId = new Map<string, number>();
      const network_tree = server_networks.rows.map((net) => {
        const netId = generateId();
        networkNameToId.set(net.name, netId);
        return {
          id: netId,
          name: net.name,
          parent: serversId,
          type: "server_network",
        };
      });

      service_tree.push(...network_tree);

      const server_locations = await pool.query(
        `SELECT DISTINCT site_location AS name, network FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const locationKeyToId = new Map<string, number>();
      const location_tree = server_locations.rows.map((loc) => {
        const key = `${loc.network}-${loc.name}`;
        const locId = generateId();
        locationKeyToId.set(key, locId);
        return {
          id: locId,
          name: loc.name,
          parent: networkNameToId.get(loc.network),
          type: "server_location",
        };
      });

      service_tree.push(...location_tree);

      const server_types = await pool.query(
        `SELECT DISTINCT type, site_location, network FROM service_virtual_machines WHERE service_parent = $1`,
        [id],
      );

      const typeKeyToId = new Map<string, number>();
      const type_tree = server_types.rows.map((row) => {
        const key = `${row.network}-${row.site_location}-${row.type}`;
        const typeId = generateId();
        typeKeyToId.set(key, typeId);
        const parentKey = `${row.network}-${row.site_location}`;
        return {
          id: typeId,
          name: row.type,
          parent: locationKeyToId.get(parentKey),
          type: "server_type",
        };
      });

      service_tree.push(...type_tree);

      const server_counts = await pool.query(
        `SELECT COUNT(*) AS count, type, site_location, network 
         FROM service_virtual_machines 
         WHERE service_parent = $1 
         GROUP BY network, site_location, type`,
        [id],
      );

      const server_tree = server_counts.rows.map((vm) => {
        const key = `${vm.network}-${vm.site_location}-${vm.type}`;
        return {
          id: generateId(),
          name: vm.count,
          parent: typeKeyToId.get(key),
          type: "server",
        };
      });

      service_tree.push(...server_tree);

      const related_systems = await pool.query(
        `SELECT COUNT(system_info.system_name) as name
         FROM service_info
         INNER JOIN system_service_relationship ON service_info.service_id = system_service_relationship.service_id
         INNER JOIN system_info ON system_service_relationship.system_id = system_info.system_id
         WHERE service_info.service_id = $1
         HAVING COUNT(system_info.system_name) > 0`,
        [id],
      );

      const related_systems_tree = related_systems.rows.map((system) => ({
        id: generateId(),
        name: system.name,
        parent: systemsId,
        type: "system",
      }));

      service_tree.push(...related_systems_tree);

      res.status(200).json({ data: service_tree });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const tree_diagram_active_locations = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let currentId = 100000;
    const generateId = () => currentId++;

    const tree: any[] = [];

    const rootId = generateId();

    tree.push({
      id: rootId,
      name: "locations",
      parent: null,
      type: "root",
    });

    const active_locations = await pool.query(`
      WITH locations AS (
        SELECT active_location
        FROM system_info

        UNION ALL

        SELECT active_location
        FROM service_info
      )
      SELECT DISTINCT (active_location)
      FROM locations
      WHERE TRIM(active_location) <> '' AND lower(trim(active_location)) <> 'unknown' AND active_location IS NOT NULL;
    `);

    const locationNameToId = new Map<string, number>();

    for (const location of active_locations.rows) {
      const locationId = generateId();
      const location_name = location["active_location"];
      locationNameToId.set(location_name, locationId);

      tree.push({
        id: locationId,
        name: location_name,
        parent: rootId,
        type: "location",
      });
    }

    const entities = await pool.query(`
      WITH entity_locations AS (
        SELECT system_name AS name, active_location AS location, 'system' AS type
        FROM system_info

        UNION ALL

        SELECT service_name AS name, active_location AS location, 'service' AS type
        FROM service_info
      )
      SELECT * FROM entity_locations
      WHERE TRIM(location) <> '' AND lower(trim(location)) <> 'unknown' AND location IS NOT NULL;
    `);

    for (const entity of entities.rows) {
      const entity_name = entity["name"];
      const entity_location = entity["location"];

      const parent_id = locationNameToId.get(entity_location);
      const entity_type = entity["type"];

      tree.push({
        id: generateId(),
        name: entity_name,
        parent: parent_id!,
        type: entity_type,
      });
    }

    return res.status(200).json({ data: tree });
  },
);

export const display_document = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    if (type === "system") {
      await ReplaceSignedUrls(type, id);

      const data = await pool.query("select * from system_docs where id = $1", [
        id,
      ]);

      res.status(200).json({
        data: data.rows,
      });
      return;
    } else if (type === "service") {
      await ReplaceSignedUrls(type, id);

      const data = await pool.query(
        "select * from service_docs where id = $1",
        [id],
      );

      res.status(200).json({
        data: data.rows,
      });
      return;
    }

    return next(new AppError("Please select data type", 400));
  },
);

export const search_docs = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.query as string;

    const docs = await pool.query(
      `
      with system_and_services_docs as (
        select id, title, content, 
        'system' as type
        from system_docs

        union all

        select id, title, content, 
        'service' as type
        from service_docs
      )
      select id, title, type
      from system_and_services_docs
      where content::text ilike $1 or title ilike $1;
      `,
      [`%${query}%`],
    );

    res.status(200).json({ data: docs.rows });
  },
);

export const active_locations_aggregation = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const impact = req.query.impact as string | undefined;

    const impacts = impact ? impact.split(",") : null;

    const environment = req.query.environment as string | undefined;

    const environments = environment ? environment.split(",") : null;

    const active_locations_aggregated = await pool.query(
      `
          WITH system_and_services AS (
              SELECT
                  system_id AS id,
                  system_name AS name,
                  active_location AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'system' AS type,
                  'מיקום נוכחי' as tag,
                  impact
              FROM system_info

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  active_location AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                  'service' AS type,
                  'מיקום נוכחי' as tag,
                  impact
              FROM service_info
          ),

          top_3_locations AS (
              SELECT
                  location,
                  COUNT(*) AS amount
              FROM system_and_services
              WHERE TRIM(location) <> '' AND location IS NOT NULL
              GROUP BY location
              ORDER BY amount DESC
              LIMIT 3
          ),

          filtered_system_and_services AS (
              SELECT *
              FROM system_and_services
              WHERE location IN (SELECT location FROM top_3_locations)
              and impact = ANY(COALESCE($1, ARRAY[impact]))
              and environment = ANY(COALESCE($2, ARRAY[environment]))
          ),

          environment_group AS (
              SELECT
                  location,
                  environment,
                  COUNT(*) AS item_count,
                  json_agg(
                      json_build_object(
                          'id', id,
                          'name', name,
                          'type', type,
                          'backup', backup,
                          'infrastructure', infrastructure,
                          'tag', tag
                      )
                      ORDER BY name
                  ) AS items
              FROM filtered_system_and_services
              WHERE environment IS NOT null AND trim(environment) <> '' AND lower(trim(environment)) <> 'unknown'
              GROUP BY location, environment
          ),

          location_group AS (
              SELECT
                  location,
                  SUM(item_count) AS total_count,
                  json_agg(
                      json_build_object(
                          'environment', environment,
                          'count', item_count,
                          'items', items
                      )
                      ORDER BY item_count desc
                  ) AS environments
              FROM environment_group
              GROUP BY location
          )

          SELECT
              location,
              'מיקום נוכחי' as tag,
              total_count AS count,
              environments
          FROM location_group
          ORDER BY location;
      `,
      [impacts, environments],
    );

    res.status(200).json({ data: active_locations_aggregated.rows });
  },
);

export const entities_locations_aggregation = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const impact = req.query.impact as string | undefined;

    const impacts = impact ? impact.split(",") : null;

    const environment = req.query.environment as string | undefined;

    const environments = environment ? environment.split(",") : null;

    const entities_locations_aggregated = await pool.query(
      `
          WITH system_and_services AS (
              SELECT
                  system_id AS id,
                  system_name AS name,
                  active_location AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'מיקום נוכחי' as tag,
                  'system' AS type,
                  impact
              FROM system_info
              where active_location = 'קריה'

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  active_location AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                  'מיקום נוכחי' as tag,
                  'service' AS type,
                  impact
              FROM service_info
              where active_location = 'קריה'
              
              UNION all
              
              SELECT
                  system_id AS id,
                  system_name AS name,
                  secondary_site  AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'אתר משני' as tag,
                  'system' AS type,
                  impact
              FROM system_info
              where secondary_site = 'מעוף'

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  secondary_site AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                  'אתר משני' as tag,
                  'service' AS type,
                  impact
              FROM service_info
              where secondary_site = 'מעוף'
   
              UNION all
              
              SELECT
                  system_id AS id,
                  system_name AS name,
                  third_site  AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'אתר שלישי' as tag,
                  'system' AS type,
                  impact
              FROM system_info
              where third_site = 'מצודת דוד'

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  third_site AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                   'אתר שלישי' as tag,
                  'service' AS type,
                  impact
              FROM service_info
              where third_site = 'מצודת דוד'
          ),
          
          filtered_system_and_services as (
          
          	select * from system_and_services
          	WHERE impact = ANY(COALESCE($1, ARRAY[impact]))
          	and environment = ANY(COALESCE($2, ARRAY[environment]))
          
          ),
          
          environment_group AS (
              SELECT
                  location,
                  environment,
                  tag,
                  COUNT(*) AS item_count,
                  json_agg(
                      json_build_object(
                          'id', id,
                          'name', name,
                          'type', type,
                          'backup', backup,
                          'infrastructure', infrastructure,
                          'tag', tag
                      )
                      ORDER BY name
                  ) AS items
              FROM filtered_system_and_services
              WHERE environment IS NOT null AND trim(environment) <> '' AND lower(trim(environment)) <> 'unknown'
              GROUP BY location, environment, tag
          ),

          location_group AS (
              SELECT
                  location,
                  tag,
                  SUM(item_count) AS total_count,
                  json_agg(
                      json_build_object(
                          'environment', environment,
                          'count', item_count,
                          'items', items
                      )
                      ORDER BY item_count desc
                  ) AS environments
              FROM environment_group
              GROUP BY location, tag
          )

          SELECT
              location,
              tag,
              total_count AS count,
              environments
          FROM location_group
          ORDER BY tag = 'מיקום נוכחי', tag = 'אתר משני', tag = 'אתר שלישי';
      `,
      [impacts, environments],
    );

    res.status(200).json({ data: entities_locations_aggregated.rows });
  },
);

export const total_locations_aggregation = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const impact = req.query.impact as string | undefined;

    const impacts = impact ? impact.split(",") : null;

    const environment = req.query.environment as string | undefined;

    const environments = environment ? environment.split(",") : null;

    const total_locations_aggregated = await pool.query(
      `
          WITH system_and_services AS (
              SELECT
                  system_id AS id,
                  system_name AS name,
                  active_location AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'מיקום נוכחי' AS tag,
                  'system' AS type,
                  impact
              FROM system_info

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  active_location AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                  'מיקום נוכחי' AS tag,
                  'service' AS type,
                  impact
              FROM service_info

              UNION ALL

              SELECT
                  system_id AS id,
                  system_name AS name,
                  secondary_site AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'אתר משני' AS tag,
                  'system' AS type,
                  impact
              FROM system_info

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  secondary_site AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                  'אתר משני' AS tag,
                  'service' AS type,
                  impact
              FROM service_info

              UNION ALL

              SELECT
                  system_id AS id,
                  system_name AS name,
                  third_site AS location,
                  backup_type AS backup,
                  infrastructure_type AS infrastructure,
                  environment,
                  'אתר שלישי' AS tag,
                  'system' AS type,
                  impact
              FROM system_info

              UNION ALL

              SELECT
                  service_id AS id,
                  service_name AS name,
                  third_site AS location,
                  backup_type AS backup,
                  NULL AS infrastructure,
                  environment,
                  'אתר שלישי' AS tag,
                  'service' AS type,
                  impact
              FROM service_info
          ),
          
          filtered_system_and_services as (
          
          	select * from system_and_services
          	WHERE impact = ANY(COALESCE($1, ARRAY[impact]))
          	and environment = ANY(COALESCE($2, ARRAY[environment]))
          
          ),

          environment_group AS (
              SELECT
                  location,
                  environment,
                  COUNT(*) AS item_count,
                  json_agg(
                      json_build_object(
                          'id', id,
                          'name', name,
                          'type', type,
                          'backup', backup,
                          'infrastructure', infrastructure,
                          'tag', tag
                      )
                      ORDER BY name
                  ) AS items
              FROM filtered_system_and_services
              WHERE environment IS NOT NULL
                AND trim(environment) <> ''
                AND lower(trim(environment)) <> 'unknown'
              GROUP BY
                  location,
                  environment
          ),

          location_group AS (
              SELECT
                  location,
                  SUM(item_count) AS total_count,
                  json_agg(
                      json_build_object(
                          'environment', environment,
                          'count', item_count,
                          'items', items
                      )
                      ORDER BY item_count DESC
                  ) AS environments
              FROM environment_group
              GROUP BY location
          )

          SELECT
              location,
              'מיקום אתר' AS tag,
              total_count AS count,
              environments
          FROM location_group
          WHERE location IN ('קריה', 'מעוף', 'מצודת דוד')
          ORDER BY location =  'קריה', location = 'מעוף', location = 'מצודת דוד';
      `,
      [impacts, environments],
    );

    res.status(200).json({
      data: total_locations_aggregated.rows,
    });
  },
);

export const entities_locations_table = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const impact = req.query.impact as string | undefined;

    const impacts = impact ? impact.split(",") : null;

    const environment = req.query.environment as string | undefined;

    const environments = environment ? environment.split(",") : null;

    const backup_type = req.query.backup_type as string | undefined;

    const backup_types = backup_type ? backup_type.split(",") : null;

    const is_preferred_location = req.query.is_preferred_location as
      | string
      | undefined;

    const is_preferred_locations = is_preferred_location
      ? is_preferred_location.split(",")
      : null;

    const infrastructure_type = req.query.infrastructure_type as
      | string
      | undefined;

    const infrastructure_types = infrastructure_type
      ? infrastructure_type.split(",")
      : null;

    const locations = await pool.query(
      `
      with locations as (
        select system_id as id, system_name as name, active_location, secondary_site, third_site, backup_type, 'system' as type, impact, preferred_site, environment, infrastructure_type, info,

        case
          when active_location = preferred_site then 'true'
          
          else 'false'
          
        end as is_preferred_location

        from system_info

        union all

        select service_id as id, service_name as name, active_location, secondary_site, third_site, backup_type, 'service' as type, impact, preferred_site, environment, 'אין' as infrastructure_type, info,

        case
          when active_location = preferred_site then 'true'
          
          else 'false'
          
        end as is_preferred_location

        from service_info
      )
      select * from locations
      WHERE impact = ANY(COALESCE($1, ARRAY[impact]))
      and environment = ANY(COALESCE($2, ARRAY[environment]))
      and backup_type = ANY(COALESCE($3, ARRAY[backup_type]))
      and is_preferred_location = ANY(COALESCE($4, ARRAY[is_preferred_location]))
      and infrastructure_type = ANY(COALESCE($5, ARRAY[infrastructure_type]))
      ORDER BY
        CASE impact
          WHEN 'גבוהה' THEN 1
          WHEN 'בינונית' THEN 2
          WHEN 'נמוכה' THEN 3
          ELSE 4
        END;
    `,
      [
        impacts,
        environments,
        backup_types,
        is_preferred_locations,
        infrastructure_types,
      ],
    );

    res.status(200).json({ data: locations.rows });
  },
);

export const entities_impacts = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const impacts = await pool.query(`
      WITH entities_impact AS (
        SELECT impact FROM system_info

        UNION ALL

        SELECT impact FROM service_info
      ),
      filtered_impacts AS (
        SELECT DISTINCT impact
        FROM entities_impact
      )
      SELECT impact
      FROM filtered_impacts where trim(impact) != ''
      ORDER BY
        CASE impact
          WHEN 'נמוכה'   THEN 1
          WHEN 'בינונית' THEN 2
          WHEN 'גבוהה'   THEN 3
          ELSE 4
        END;
    `);

    res.status(200).json({ data: impacts.rows });
  },
);

export const docs_suggestions = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(200).json({ data: [] });
    }

    const regex = `${query}[^"]*`;

    const docs = await pool.query(
      `
      WITH docs AS (
        SELECT content FROM system_docs
        UNION ALL
        SELECT content FROM service_docs
      ),
      regex_data AS (
        SELECT DISTINCT
          LEFT(regexp_matches[1], 100) AS match
        FROM docs,
          regexp_matches(content::text, $1, 'gi')
      )
      SELECT match
      FROM regex_data
      ORDER BY length(match) ASC;
      `,
      [regex],
    );

    res.status(200).json({ data: docs.rows });
  },
);

export const entities_environments = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const environments = await pool.query(`
      WITH entities_environments AS (
        SELECT environment
        FROM system_info

        UNION ALL

        SELECT environment
        FROM service_info
      )
      SELECT DISTINCT environment
      FROM entities_environments
      WHERE TRIM(environment) != '';
    `);

    res.status(200).json({
      data: environments.rows,
    });
  },
);

export const entities_backup_types = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const environments = await pool.query(`
      WITH entities_backup_types AS (
        SELECT backup_type
        FROM system_info

        UNION ALL

        SELECT backup_type
        FROM service_info
        
      ), filtered_backup_types as (
      	
         SELECT DISTINCT backup_type
      	 FROM entities_backup_types
      	 
      ) select backup_type from filtered_backup_types 
        WHERE TRIM(backup_type) != ''
        ORDER BY
            CASE TRIM(backup_type)
                WHEN 'אין' THEN 1
                WHEN 'יש (קר)' THEN 2
                WHEN 'יש (A-A)' THEN 3
                WHEN 'יש (A-A-A)' THEN 4
            END;
    `);

    res.status(200).json({
      data: environments.rows,
    });
  },
);

export const entities_infrastructure_types = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const infrastructure_types = await pool.query(`
        select distinct infrastructure_type from system_info
        where trim(infrastructure_type) <> '';
    `);

    res.status(200).json({
      data: infrastructure_types.rows,
    });
  },
);

export const scripts_menu = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const scripts = await pool.query(`
        with scripts as ( 

          select id, title, 'system' as type, description, filename, system_name as entity_name, system_id as entity_id from system_scripts
          inner join system_info on system_scripts.system_parent = system_info.system_id
          
          union all
          
          select id, title, 'service' as type, description, filename, service_name as entity_name, service_id as entity_id from service_scripts
          inner join service_info on service_scripts.service_parent  = service_info.service_id 
          
        ) select * from scripts;
    `);

    res.status(200).json({
      data: scripts.rows,
    });
  },
);

export const list_server_scripts = CatchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data = await runRemoteScript(`cd /home/scripts && ls`);

    res.status(200).json({
      data: data.stdout.split("\n").filter(Boolean),
    });
  },
);

export const get_specific_script = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    const scripts = await pool.query(
      `
        with scripts as ( 

          select id, title, 'system' as type, description, filename, system_name as entity_name, system_id as entity_id from system_scripts
          inner join system_info on system_scripts.system_parent = system_info.system_id
          
          union all
          
          select id, title, 'service' as type, description, filename, service_name as entity_name, service_id as entity_id from service_scripts
          inner join service_info on service_scripts.service_parent = service_info.service_id 
          
        ) select * from scripts where id = $1 and type = $2;
    `,
      [id, type],
    );

    res.status(200).json({
      data: scripts.rows,
    });
  },
);

export const active_location_history = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const type = req.query.type;

    const table =
      type === "system"
        ? "system_active_location_history"
        : "service_active_location_history";

    const column = type === "system" ? "system_id" : "service_id";

    const data = await pool.query(
      `
      select id, ${column} as entity_id, active_location, started_at, ended_at from ${table}
      where ${column} = $1
      order by started_at desc;
    `,
      [id],
    );

    res.status(200).json({ data: data.rows });
  },
);
// * fields_suggestions_related_v1
export const fields_suggestions = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowedFields = [
      "type",
      "id",
      "name",
      "impact",
      "owned_by",
      "core_network",
      "masad",
      "secondary_site",
      "backup_type",
      "infrastructure_type",
      "authentication",
      "vm_title",
      "vm_location",
      "vm_network",
      "vm_type",
      "vm_cluster",
      "vm_host",
      "vm_ip",
      "vm_room",
      "vm_rack",
      "dependency",
      "active_location",
      "info",
      "third_site",
      "environment",
      "cert_infrastructure",
    ];

    const field = req.query.field as string;
    const value = req.query.value as string;

    if (!allowedFields.includes(field)) {
      return next(new AppError("Invalid filter field", 400));
    }

    const query = `
      WITH systems_and_services AS ( 
        SELECT 
         'system' AS type,
          system_info.system_id AS id,
          system_info.system_name AS name,
          system_info.impact,
          system_info.owned_by,
          system_info.core_network,
          system_info.active_location,
          system_info.masad,
          system_info.info,
          system_info.third_site,
          system_info.environment,
          system_info.cert_infrastructure,
          system_info.secondary_site,
          system_info.backup_type,
          infrastructure_type,
          system_authentication.authentication_type AS authentication,
          system_virtual_machines.title AS vm_title,
          system_virtual_machines.site_location AS vm_location,
          system_virtual_machines.network AS vm_network,
          system_virtual_machines.type AS vm_type,
          system_virtual_machines.cluster AS vm_cluster,
          system_virtual_machines.host AS vm_host,
          system_virtual_machines.ip AS vm_ip,
          system_virtual_machines.room AS vm_room,
          system_virtual_machines.rack AS vm_rack,
          system_dependencies.dependency
        FROM system_info
        LEFT JOIN system_authentication ON system_info.system_id = system_authentication.system_parent
        LEFT JOIN system_virtual_machines ON system_info.system_id = system_virtual_machines.system_parent
        LEFT JOIN system_dependencies ON system_info.system_id = system_dependencies.system_parent

        UNION ALL

        SELECT 
         'service' AS type,
          service_id AS id,
          service_name AS name,
          impact,
          owned_by,
          core_network,
          active_location,
          masad,
          info,
          third_site,
          environment,
          cert_infrastructure,
          secondary_site,
          backup_type,
          NULL AS infrastructure_type,
          NULL AS authentication,
          service_virtual_machines.title AS vm_title,
          service_virtual_machines.site_location AS vm_location,
          service_virtual_machines.network AS vm_network,
          service_virtual_machines.type AS vm_type,
          service_virtual_machines.cluster AS vm_cluster,
          service_virtual_machines.host AS vm_host,
          service_virtual_machines.ip AS vm_ip,
          service_virtual_machines.room AS vm_room,
          service_virtual_machines.rack AS vm_rack,
          service_dependencies.dependency
        FROM service_info
        LEFT JOIN service_virtual_machines ON service_info.service_id = service_virtual_machines.service_parent
        LEFT JOIN service_dependencies ON service_info.service_id = service_dependencies.service_parent
      )
      SELECT distinct(${field}) as match
      FROM systems_and_services 
      WHERE ${field} ILIKE $1;
    `;

    const filtered_result = await pool.query(query, [`%${value}%`]);

    res.status(200).json({ data: filtered_result.rows });
  },
);

// * fields_suggestions_related_v2
export const field_search_source = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const value = req.query.value as string;

    const data = await pool.query(
      `
      WITH systems_and_services AS ( 
        SELECT 
        'system' AS type,
          system_info.system_id AS id,
          system_info.system_name AS name,
          system_info.impact,
          system_info.owned_by,
          system_info.core_network,
          system_info.active_location,
          system_info.masad,
          system_info.info,
          system_info.third_site,
          system_info.environment,
          system_info.cert_infrastructure,
          system_info.secondary_site,
          system_info.backup_type,
          infrastructure_type,
          system_authentication.authentication_type AS authentication,
          system_virtual_machines.title AS vm_title,
          system_virtual_machines.site_location AS vm_location,
          system_virtual_machines.network AS vm_network,
          system_virtual_machines.type AS vm_type,
          system_virtual_machines.cluster AS vm_cluster,
          system_virtual_machines.host AS vm_host,
          system_virtual_machines.ip AS vm_ip,
          system_virtual_machines.room AS vm_room,
          system_virtual_machines.rack AS vm_rack,
          system_dependencies.dependency
        FROM system_info
        LEFT JOIN system_authentication ON system_info.system_id = system_authentication.system_parent
        LEFT JOIN system_virtual_machines ON system_info.system_id = system_virtual_machines.system_parent
        LEFT JOIN system_dependencies ON system_info.system_id = system_dependencies.system_parent

        UNION ALL

        SELECT 
        'service' AS type,
          service_id AS id,
          service_name AS name,
          impact,
          owned_by,
          core_network,
          active_location,
          masad,
          info,
          third_site,
          environment,
          cert_infrastructure,
          secondary_site,
          backup_type,
          NULL AS infrastructure_type,
          NULL AS authentication,
          service_virtual_machines.title AS vm_title,
          service_virtual_machines.site_location AS vm_location,
          service_virtual_machines.network AS vm_network,
          service_virtual_machines.type AS vm_type,
          service_virtual_machines.cluster AS vm_cluster,
          service_virtual_machines.host AS vm_host,
          service_virtual_machines.ip AS vm_ip,
          service_virtual_machines.room AS vm_room,
          service_virtual_machines.rack AS vm_rack,
          service_dependencies.dependency
        FROM service_info
        LEFT JOIN service_virtual_machines ON service_info.service_id = service_virtual_machines.service_parent
        LEFT JOIN service_dependencies ON service_info.service_id = service_dependencies.service_parent
    ), field_source AS (
    
      SELECT owned_by AS match, 'owned_by' AS source, 'צוות' AS translation FROM systems_and_services
      UNION ALL
      SELECT active_location AS match, 'active_location' AS source, 'מיקום נוכחי' AS translation FROM systems_and_services
      UNION ALL
      SELECT secondary_site AS match, 'secondary_site' AS source, 'אתר משני' AS translation FROM systems_and_services
      UNION ALL
      SELECT third_site AS match, 'third_site' AS source, 'אתר שלישי' AS translation FROM systems_and_services
      UNION ALL
      SELECT core_network AS match, 'core_network' AS source, 'רשת' AS translation FROM systems_and_services
      UNION ALL
      SELECT infrastructure_type AS match, 'infrastructure_type' AS source, 'סוג תשתית' AS translation FROM systems_and_services
      UNION ALL
      SELECT cert_infrastructure AS match, 'cert_infrastructure' AS source, 'תשתית תעודה' AS translation FROM systems_and_services
      UNION ALL
      SELECT environment AS match, 'environment' AS source, 'סביבה' AS translation FROM systems_and_services
      UNION ALL
      SELECT backup_type AS match, 'backup_type' AS source, 'סוג גיבוי' AS translation FROM systems_and_services
      UNION ALL
      SELECT authentication AS match, 'authentication' AS source, 'סוג הזדהות' AS translation FROM systems_and_services
      UNION ALL
      SELECT dependency AS match, 'dependency' AS source, 'תלות' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_title AS match, 'vm_title' AS source, 'שם שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_location AS match, 'vm_location' AS source, 'מיקום שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_network AS match, 'vm_network' AS source, 'רשת שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_type AS match, 'vm_type' AS source, 'סוג שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_cluster AS match, 'vm_cluster' AS source, 'קלאסטר שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_host AS match, 'vm_host' AS source, 'שרת פיזי' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_ip AS match, 'vm_ip' AS source, 'כתובת שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_room AS match, 'vm_room' AS source, 'חדר שרת' AS translation FROM systems_and_services
      UNION ALL
      SELECT vm_rack AS match, 'vm_rack' AS source, 'מסד שרת' AS translation FROM systems_and_services
    )
    SELECT DISTINCT match, source, translation
    FROM field_source
    WHERE match IS NOT null and match ilike $1;
    `,
      [`%${value}%`],
    );

    res.status(200).json({ data: data.rows });
  },
);

export const user_contributions = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const range = req.query.range as string | undefined;

    const available_ranges = [
      "24 hours",
      "3 days",
      "7 days",
      "1 month",
      "1 year",
    ];

    if (range && available_ranges.includes(range)) {
      const data = await pool.query(`
        with user_contributions as (

          select logs.user_id, users.username, 
          logs.action, logs.created_at from logs
          inner join users on users.id = logs.user_id
          where action != 'GET' and is_script = false and created_at >= now() - interval '${range}'

        ), user_contribution_counts as (
        
        	select username, count(*) as contributions from user_contributions
        	group by username
         
        ) select username, contributions, row_number() over(order by contributions desc) as top, 'range' as mode
         from user_contribution_counts;
    `);

      res.status(200).json({
        data: data.rows,
      });

      return;
    }

    const data = await pool.query(`
        with user_contributions as (

          select logs.user_id, users.username, 
          logs.action, logs.created_at from logs
          inner join users on users.id = logs.user_id
          where action != 'GET' and is_script = false
          
        ), user_contribution_counts as (
        
        	select username, count(*) as contributions from user_contributions
        	group by username
         
        ) select username, contributions, row_number() over(order by contributions desc) as top, 'total' as mode
          from user_contribution_counts;
    `);

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const total_users_contributions_count = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await pool.query(`

      with contributions as (

          select date(created_at), cast(count(*) as int)
            from logs inner join users on users.id = logs.user_id
            where action <> 'GET' and users.is_script = false
            group by date(created_at) order by date asc
            
      ) select date, count, cast(cast(count as decimal) / (select max(count) from contributions) * 100 as int) as percentage
        from contributions;
      
    `);

    res.status(200).json({
      data: data.rows,
    });
  },
);


export const dependency_suggestions = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.q

    const data = await pool.query(`

      with dependencies as (

        select dependency from system_dependencies
        union all
        select dependency from service_dependencies


      ) select distinct(dependency) from dependencies
        where dependency ilike $1`, [`%${query}%`]);

    res.status(200).json({
      data: data.rows,
    });
  },
);

export const authentication_type_suggestions = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query.q

    const data = await pool.query(`
      
      select distinct(authentication_type) 
      from system_authentication
      where authentication_type ilike $1;
      
      `, [`%${query}%`])


    res.status(200).json({
      data: data.rows,
    });
  },
);

export const dev_docs_api_endpoint = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      base_url: process.env.DEV_ENDPOINT ?? "https://api.example.com",
    });
  },
);