import api from "./Http";

export const AuthUserLogin = async (username: string, password: string) => {
  const response = await api.post("/api/v1/auth/login", {
    username,
    password,
  });

  return response;
};
