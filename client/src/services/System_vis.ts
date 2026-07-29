import api from "./Http";

export const get_system_virtual_machines_usage = async (
  id: number | string | undefined
) => {
  const response = await api.get(
    `/api/v1/visualization/system/virtual_machines_usage/${id}`
  );
  return response.data;
};

export const get_system_auth_types = async () => {
  const response = await api.get(
    "/api/v1/visualization/system/authentication_types"
  );

  return response.data;
};

export const get_system_infrastructure_types = async () => {
  const response = await api.get(
    "/api/v1/visualization/system/infrastructure_types"
  );

  return response.data;
};
