import api from "./Http";

export const get_virtual_machine_usage = async (filter: string, limit:number) => {
  const response = await api.get(
    `/api/v1/visualization/virtual_machines_usage?filter=${filter}&limit=${limit}`
  );

  return response.data;
};
