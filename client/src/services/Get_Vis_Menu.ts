import api from "./Http";

export const total_services_and_systems = async () => {
  const response = await api.get(
    "/api/v1/visualization/services_and_systems/menu"
  );

  return response.data;
};
