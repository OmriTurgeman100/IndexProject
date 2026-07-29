create table system_service_relationship (
    id serial primary key,
    system_id integer references system_info(system_id) on delete cascade,
    service_id integer references service_info(service_id) on delete cascade
);