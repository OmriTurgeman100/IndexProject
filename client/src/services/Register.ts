import api from "./Http";

export const AuthUserRegister = async (username: string, password: string) => {
  const response = await api.post("/api/v1/auth/register", {
    username,
    password,
  });

  return response;
};
