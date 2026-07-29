create table users (
    id serial primary key,
    username varchar(50) unique not null,
    password text not null,
    role text default 'guest'
);

ALTER TABLE users
ADD COLUMN access_scope TEXT NOT NULL DEFAULT 'total'
CHECK (access_scope IN ('total','custom'));


CREATE TABLE user_entity_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  system_id  INTEGER REFERENCES system_info(system_id),
  service_id INTEGER REFERENCES service_info(service_id),

  UNIQUE (user_id, system_id),
  UNIQUE (user_id, service_id)
);