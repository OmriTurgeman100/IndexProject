create table service_info (
    service_id serial primary key,
    service_name text,
    impact text,
    core_network text,
    cert_type text,
    main_site text,
    main_site_location text,
    masad text,
    secondary_site text,
    secondary_site_location text,
    backup_type text,
    additional_site text
);

create table service_dependencies (
    id serial primary key,
    service_parent integer references service_info(service_id),
    dependency text
);

create table service_virtual_machines (
    id serial primary key,
    service_parent integer references service_info(service_id),
    title text,
    site_location text
);

create table service_dep_info (
    id serial primary key,
    service_parent integer references service_info(service_id),
    service_dep_parent integer references service_dependencies(id),
    description text
);

alter table service_info 
add column active_location text default 'UnKnown';

alter table service_virtual_machines
add column network text default 'UnKnown',
add column type text default 'UnKnown';

alter table service_info 
add column info text default 'UnKnown',
add column third_site text default 'UnKnown',
add column environment text default 'UnKnown',
add column cert_infrastructure text default 'UnKnown',
add column owned_by text default 'UnKnown';

create table service_links (
	id serial primary key,
    service_parent integer references service_info(service_id),
    title text,
    link text
);

create table service_docs (
    id serial primary key,
    service_id integer references service_info(service_id),
    title text not null,
    content jsonb,
    created_at timestamp default now()
);

alter table service_virtual_machines
add column cluster text default 'UnKnown';

CREATE TABLE service_files (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES service_info(service_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE, 
    created_at TIMESTAMP DEFAULT NOW()
);

alter table service_info
add column preferred_site text;

ALTER TABLE service_info
DROP COLUMN cert_type,
DROP COLUMN main_site,
DROP COLUMN main_site_location,
DROP COLUMN secondary_site_location,
DROP COLUMN additional_site;

alter table service_virtual_machines
add column host text,
add column ip text;