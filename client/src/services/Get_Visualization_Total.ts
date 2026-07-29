import api from "./Http";

export const total_services_and_systems = async () => {
  const response = await api.get("/api/v1/visualization");

  return response.data;
};

export const total_cert_types = async () => {
  const response = await api.get(
    "/api/v1/visualization/certificate_infrastructure_types",
  );

  return response.data;
};

export const total_network_types = async () => {
  const response = await api.get("/api/v1/visualization/network_types");

  return response.data;
};

export const custom_services_systems = async (
  field: string | undefined,
  value: string,
) => {
  const response = await api.get(
    `/api/v1/visualization/services-systems/custom?field=${field}&value=${value}`,
  );

  return response.data;
};

export const tree_diagram = async (
  id: string | undefined,
  type: string | undefined,
) => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/${id}?type=${type}`,
  );

  return response.data;
};

export const tree_diagram_stats = async (
  id: string | undefined,
  type: string | undefined,
) => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/stats/${id}?type=${type}`,
  );

  return response.data;
};

export const tree_diagram_custom = async (
  id: string | undefined,
  type: string | undefined,
) => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/custom/${id}?type=${type}`,
  );

  return response.data;
};

export const tree_diagram_advanced = async (
  id: string | undefined,
  type: string | undefined,
) => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/advanced/${id}?type=${type}`,
  );

  return response.data;
};

export const tree_diagram_stats_advanced = async (
  id: string | undefined,
  type: string | undefined,
) => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/stats/advanced/${id}?type=${type}`,
  );

  return response.data;
};

export const tree_diagram_custom_advanced = async (
  id: string | undefined,
  type: string | undefined,
) => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/custom/advanced/${id}?type=${type}`,
  );

  return response.data;
};

export const advanced_services_systems = async (query: string) => {
  const response = await api.get(
    `/api/v1/visualization/services-systems/advanced?${query}`,
  );
  return response.data;
};

export const get_active_locations = async () => {
  const response = await api.get("/api/v1/visualization/active/locations");

  return response.data;
};

export const get_network_diagram = async (id: string | number | undefined) => {
  const response = await api.get(`/api/v1/visualization/network/${id}`);

  return response.data;
};

export const search_docs = async (query: string) => {
  const response = await api.get(
    `/api/v1/visualization/docs/search/?query=${query}`,
  );

  return response.data;
};

export const tree_diagram_active_locations = async () => {
  const response = await api.get(
    `/api/v1/visualization/tree/diagram/active_locations`,
  );

  return response.data;
};

export const locations_aggregation = async (
  impacts?: string[],
  environments?: string[],
) => {
  const params: Record<string, string> = {};

  if (impacts?.length) params.impact = impacts.join(",");
  if (environments?.length) params.environment = environments.join(",");

  const response = await api.get(
    `/api/v1/visualization/active/locations/aggregation`,
    { params },
  );

  return response.data;
};

export const entities_locations_aggregation = async (
  impacts?: string[],
  environments?: string[],
) => {
  const params: Record<string, string> = {};

  if (impacts?.length) params.impact = impacts.join(",");
  if (environments?.length) params.environment = environments.join(",");

  const response = await api.get(
    `/api/v1/visualization/entities/locations/aggregation`,
    { params },
  );

  return response.data;
};

export const total_locations_aggregation = async (
  impacts?: string[],
  environments?: string[],
) => {
  const params: Record<string, string> = {};

  if (impacts?.length) params.impact = impacts.join(",");
  if (environments?.length) params.environment = environments.join(",");

  const response = await api.get(
    `/api/v1/visualization/total/locations/aggregation`,
    { params },
  );

  return response.data;
};

export const entities_locations_table = async (
  impacts?: string[],
  environments?: string[],
  backup_types?: string[],
  isPreferred?: string[],
  infrastructure_types?: string[],
) => {
  const params: Record<string, string> = {};

  if (impacts?.length) params.impact = impacts.join(",");

  if (environments?.length) params.environment = environments.join(",");

  if (backup_types?.length) params.backup_type = backup_types.join(",");

  if (isPreferred?.length) params.is_preferred_location = isPreferred.join(",");

  if (infrastructure_types?.length)
    params.infrastructure_type = infrastructure_types.join(",");

  const response = await api.get(
    `/api/v1/visualization/entities/locations/table`,
    { params },
  );

  return response.data;
};

export const entities_impact_data = async () => {
  const response = await api.get(`/api/v1/visualization/entities/data/impacts`);

  return response.data;
};

export const docs_auto_suggestions = async (query: string) => {
  const response = await api.get(
    `/api/v1/visualization/docs/auto/suggestions?q=${query}`,
  );

  return response.data;
};

export const entities_environments_data = async () => {
  const response = await api.get(
    `/api/v1/visualization/entities/data/environments`,
  );

  return response.data;
};

export const entities_backup_types_data = async () => {
  const response = await api.get(
    `/api/v1/visualization/entities/data/backup_types`,
  );

  return response.data;
};

export const entities_infrastructure_types_data = async () => {
  const response = await api.get(
    `/api/v1/visualization/entities/data/infrastructure_types`,
  );

  return response.data;
};

export const scripts_menu = async () => {
  const response = await api.get(`/api/v1/visualization/scripts/menu`);

  return response.data;
};

export const server_scripts_list = async () => {
  const response = await api.get(`/api/v1/visualization/scripts/server`);

  return response.data;
};

export const get_specific_script = async (script_id: number, type: string) => {
  const response = await api.get(
    `/api/v1/visualization/scripts/menu/${script_id}?type=${type}`,
  );

  return response.data;
};

export const get_active_location_history = async (
  entity_id: number,
  type: string,
) => {
  const response = await api.get(
    `/api/v1/visualization/active_location_history/${entity_id}?type=${type}`,
  );

  return response.data;
};

export const field_suggestions = async (field: string, value: string) => {
  const response = await api.get(
    `/api/v1/visualization/fields/suggestions/?field=${field}&value=${value}`,
  );

  return response.data;
};

export const field_source = async (value: string) => {
  const response = await api.get(
    `/api/v1/visualization/fields/find/source?value=${value}`,
  );

  return response.data;
};

export const user_contributions = async (range: string) => {
  const response = await api.get(
    `/api/v1/visualization/users/contributions?range=${range}`,
  );

  return response.data;
};

export const total_user_contributions = async () => {
  const response = await api.get(
    `/api/v1/visualization/total/users/contributions`,
  );

  return response.data;
};

export const dependency_auto_suggestions = async (query: string) => {
  const response = await api.get(
    `/api/v1/visualization/dependency/auto/suggestions?q=${query}`,
  );

  return response.data;
};

export const authentication_auto_suggestions = async (query: string) => {
  const response = await api.get(
    `/api/v1/visualization/authentication/auto/suggestions?q=${query}`,
  );

  return response.data;
};

export const static_api_docs_endpoint = async () => {
  const response = await api.get(
    `/api/v1/visualization/static/dev-api/docs/endpoint`,
  );

  return response.data;
};