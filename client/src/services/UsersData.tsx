import api from "./Http";

export const get_users_list = async () => {
  const response = await api.get("/api/v1/users/view-permissions");

  return response.data;
};

export const get_current_user = async () => {
  const response = await api.get("/api/v1/users/me");

  return response.data;
};

export const set_user_permission = async (
  id: number | string | undefined,
  value: string,
) => {
  const response = await api.patch(`/api/v1/users/set-permissions/${id}`, {
    role: value,
  });

  return response.data;
};

export const delete_user = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/users/delete/${id}`);

  return response.data;
};

export const get_attached_entities = async (user_id: number) => {
  const response = await api.get(`/api/v1/users/attached_entities/${user_id}`);

  return response.data;
};

export const delete_user_entity = async (id: number) => {
  const response = await api.delete(
    `/api/v1/users/delete/user_entity_access/${id}`,
  );

  return response.data;
};

export const add_custom_entity_access = async (
  entity_id: number | string | undefined,
  entity_type: string,
  user_id: number,
) => {
  const response = await api.post(
    `/api/v1/users/user_entity_access/${entity_id}`,
    {
      entity_type: entity_type,
      user_id: user_id,
    },
  );

  return response.data;
};

export const set_user_access_scope = async (
  user_id: number | string | undefined,
  scope: string,
) => {
  const response = await api.patch(
    `/api/v1/users/set-access_scope/${user_id}`,
    {
      access_scope: scope,
    },
  );

  return response.data;
};

export const display_user_logs = async (
  user_id: number | string | undefined,
  page: number,
  page_size: number,
) => {
  const response = await api.get(
    `/api/v1/users/logs/${user_id}?page=${page}&page_size=${page_size}`,
  );

  return response.data;
};

export const get_attached_scripts = async (user_id: number) => {
  const response = await api.get(`/api/v1/users/attached_scripts/${user_id}`);

  return response.data;
};

export const set_user_scripts_scope = async (
  user_id: number | string | undefined,
  scope: string,
) => {
  const response = await api.patch(
    `/api/v1/users/set-script_scope/${user_id}`,
    {
      script_execution_scope: scope,
    },
  );

  return response.data;
};

export const add_custom_script_access = async (
  script_id: number | string | undefined,
  script_type: string,
  user_id: number,
) => {
  const response = await api.post(
    `/api/v1/users/user_script_access/${script_id}`,
    {
      script_type: script_type,
      user_id: user_id,
    },
  );

  return response.data;
};

export const delete_user_script = async (id: number) => {
  const response = await api.delete(
    `/api/v1/users/delete/user_script_access/${id}`,
  );

  return response.data;
};

export const get_specific_user = async (user_id: number) => {
  const response = await api.get(`/api/v1/users/info/${user_id}`);

  return response.data;
};

export const get_current_user_scripts = async () => {
  const response = await api.get("/api/v1/users/me/scripts");

  return response.data;
};

export const set_user_is_script = async (
  user_id: number | string | undefined,
  is_script: boolean,
) => {
  const response = await api.patch(
    `/api/v1/users/set-user_is_script/${user_id}`,
    {
      is_script: is_script,
    },
  );

  return response.data;
};