import api from "./Http";

export const AuthUserRefresh = async () => {
    const response = await api.post("/api/v1/auth/refresh", {});

    return response.data;
};
