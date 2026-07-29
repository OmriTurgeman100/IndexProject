import api from "./Http";

export const AuthUserLogout = async () => {
    const response = await api.post("/api/v1/auth/logout", {});

    return response.data;
};
