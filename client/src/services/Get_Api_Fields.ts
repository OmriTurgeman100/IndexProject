import api from "./Http";

export const get_service_and_systems_fields = async () => {
  const response = await api.get("/api/v1/fields");

  return response.data;
};
