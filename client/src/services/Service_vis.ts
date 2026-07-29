import api from "./Http";

export const get_service_virtual_machines_usage = async (
  id: number | string | undefined
) => {
  const response = await api.get(
    `/api/v1/visualization/service/virtual_machines_usage/${id}`
  );
  return response.data;
};
