import api from "./Http";

export const get_services_menu = async () => {
  const response = await api.get("/api/v1/services/menu");

  return response.data;
};
