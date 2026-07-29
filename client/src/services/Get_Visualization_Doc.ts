import api from "./Http";

export const get_document = async (
  id: number | string | undefined,
  type: string | undefined
) => {
  const response = await api.get(
    `/api/v1/visualization/docs/${id}/?type=${type}`
  );

  return response.data;
};
