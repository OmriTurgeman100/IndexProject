create table system_info (
    system_id serial primary key,
    system_name text,
    impact text,
    owned_by text,
    core_network text,
    main_site text,
    site_location text,
    masad text,
    secondary_site text,
    backup_type text,
    infrastructure_type text,
    system_uses_infrastructure_cert boolean,
    cert_type text
);

create table system_virtual_machines (
    id serial primary key,
    system_parent integer references system_info(system_id),
    title text,
    site_location text
);

create table system_dependencies (
    id serial primary key,
    system_parent integer references system_info(system_id),
    dependency text
);

create table system_authentication (
    id serial primary key,
    system_parent integer references system_info(system_id),
    authentication_type text
);

create table system_dep_info (
    id serial primary key,
    system_parent integer references system_info(system_id),
    system_dep_parent integer references system_dependencies(id),
    description text
);

alter table system_info 
add column active_location text default 'UnKnown'; 

alter table system_virtual_machines
add column network text default 'UnKnown',
add column type text default 'UnKnown';

alter table system_info 
add column info text default 'UnKnown',
add column third_site text default 'UnKnown',
add column environment text default 'UnKnown',
add column cert_infrastructure text default 'UnKnown';

create table system_links (
	id serial primary key,
    system_parent integer references system_info(system_id),
    title text,
    link text
);

create table system_docs (
    id serial primary key,
    system_id integer references system_info(system_id),
    title text not null,
    content jsonb,
    created_at timestamp default now()
);

alter table system_virtual_machines
add column cluster text default 'UnKnown';

CREATE TABLE system_files (
    id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES system_info(system_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE, 
    created_at TIMESTAMP DEFAULT NOW()
);

alter table system_info
add column preferred_site text;

ALTER TABLE system_info
DROP COLUMN main_site,
DROP COLUMN site_location,
DROP COLUMN system_uses_infrastructure_cert,
DROP COLUMN cert_type;

alter table system_virtual_machines
add column host text,
add column ip text;