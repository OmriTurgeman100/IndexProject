import api from "./Http";

export const get_virtual_machine_usage_per_site = async () => {
  const response = await api.get(
    "/api/v1/visualization/virtual_machines_usage/sites"
  );

  return response.data;
};
