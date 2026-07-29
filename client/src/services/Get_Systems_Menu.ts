import api from "./Http";

export const get_systems_menu = async () => {
  const response = await api.get("/api/v1/systems/menu");

  return response.data;
};
