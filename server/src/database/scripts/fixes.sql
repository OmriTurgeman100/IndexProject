-- ! There might be a bug where postgres can't increment a unique id and tries to insert an existing one

-- * This line should fix it 

SELECT setval(
  pg_get_serial_sequence('system_virtual_machines', 'id'),
  COALESCE((SELECT MAX(id) FROM system_virtual_machines), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('service_virtual_machines', 'id'),
  COALESCE((SELECT MAX(id) FROM service_virtual_machines), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('system_dependencies', 'id'),
  COALESCE((SELECT MAX(id) FROM system_dependencies), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('service_dependencies', 'id'),
  COALESCE((SELECT MAX(id) FROM service_dependencies), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('system_authentication', 'id'),
  COALESCE((SELECT MAX(id) FROM system_authentication), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('system_dep_info', 'id'),
  COALESCE((SELECT MAX(id) FROM system_dep_info), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('service_dep_info', 'id'),
  COALESCE((SELECT MAX(id) FROM service_dep_info), 0) + 1,
  false
);

SELECT setval(
    pg_get_serial_sequence('system_info', 'system_id'),
    COALESCE(MAX(system_id), 0) + 1,
    false
)
FROM system_info;

SELECT setval(
    pg_get_serial_sequence('service_info', 'service_id'),
    COALESCE(MAX(service_id), 0) + 1,
    false
)
FROM service_info;