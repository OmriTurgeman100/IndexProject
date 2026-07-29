import api from "./Http";

export const create_service_with_name = async (service_name: string) => {
  const requestBody = {
    service_name: service_name,
    impact: null,
    core_network: null,
    masad: null,
    secondary_site: null,
    backup_type: null,
    info: null,
    third_site: null,
    environment: null,
    cert_infrastructure: null,
    owned_by: null,
    preferred_site: null,
  };

  const response = await api.post("/api/v1/services", requestBody);

  return response.data;
};

export const get_specific_service = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/services/${id}`);

  return response.data;
};

export const get_service_virtual_machines = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/services/virtual_machines/${id}`);
  return response.data;
};

export const get_service_dependencies = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/services/dependencies/${id}`);
  return response.data;
};

export const update_service = async (
  id: number | string | undefined,
  field: string,
  value: any,
) => {
  const response = await api.patch(`/api/v1/services/${id}`, {
    [field]: value,
  });
  return response.data;
};

export const update_service_total = async (
  id: number | string | undefined,
  service_name: string,
  impact: string,
  core_network: string,
  masad: string,
  secondary_site: string,
  backup_type: string,
  active_location: string,
  info: string,
  third_site: string,
  environment: string,
  cert_infrastructure: string,
  owned_by: string,
  preferred_site: string,
) => {
  const response = await api.patch(`/api/v1/services/total/${id}`, {
    service_name,
    impact,
    core_network,
    masad,
    secondary_site,
    backup_type,
    active_location,
    info,
    third_site,
    environment,
    cert_infrastructure,
    owned_by,
    preferred_site,
  });

  return response.data;
};

export const update_virtual_machine = async (
  id: number | string | undefined,
  field: string,
  value: any,
) => {
  const response = await api.patch(`/api/v1/services/virtual_machines/${id}`, {
    [field]: value,
  });
  return response.data;
};

export const update_virtual_machine_total = async (
  id: number | string | undefined,
  title: string,
  site_location: string,
  network: string,
  type: string,
  cluster: string,
  host: string,
  ip: string,
  room: string,
  rack: string,
) => {
  const response = await api.patch(`/api/v1/services/virtual_machines/${id}`, {
    title: title,
    site_location: site_location,
    network: network,
    type: type,
    cluster: cluster,
    host: host,
    ip: ip,
    room: room,
    rack: rack,
  });
  return response.data;
};

export const update_dependency = async (
  id: number | string | undefined,
  value: any,
) => {
  const response = await api.patch(`/api/v1/services/dependencies/${id}`, {
    dependency: value,
  });
  return response.data;
};

export const create_dependency_for_service = async (
  id: number | string | undefined,
  dependency: string,
) => {
  const requestBody = {
    dependency: dependency,
  };

  const response = await api.post(
    `/api/v1/services/dependencies/${id}`,
    requestBody,
  );

  return response.data;
};

export const create_virtual_machine_for_service = async (
  id: number | string | undefined,
  title: string,
  site_location: string,
  network: string,
  type: string,
  cluster: string,
  host: string,
  ip: string,
  room: string,
  rack: string,
) => {
  const requestBody = {
    title: title,
    site_location: site_location,
    network: network,
    type: type,
    cluster: cluster,
    host: host,
    ip: ip,
    room: room,
    rack: rack,
  };

  const response = await api.post(
    `/api/v1/services/virtual_machines/${id}`,
    requestBody,
  );

  return response.data;
};

export const get_service_dep_info = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/services/dep/info/${id}`);
  return response.data;
};

export const post_service_dep_info = async (
  id: any,
  dep_parent_id: any,
  description: string,
) => {
  const response = await api.post(`/api/v1/services/dep/info/${id}`, {
    dep_parent_id: dep_parent_id,
    description: description,
  });
  return response.data;
};

export const patch_service_dep_info = async (
  id: number | string | null,
  description: string,
) => {
  const response = await api.patch(`/api/v1/services/dep/info/${id}`, {
    description,
  });
  return response.data;
};

export const delete_service_dep_info = async (
  id: number | string | undefined,
) => {
  const response = await api.delete(`/api/v1/services/dep/info/delete/${id}`);

  return response.data;
};

export const delete_service_dep = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/services/dep/delete/${id}`);

  return response.data;
};

export const delete_service_vm = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/services/vm/delete/${id}`);

  return response.data;
};

export const get_service_relationships = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/services/core/relationships/${id}`);
  return response.data;
};

// * links

export const get_service_links = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/services/links/${id}`);

  return response.data;
};

export const delete_service_link = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/services/links/${id}`);

  return response.data;
};

export const update_service_link = async (
  id: number | string | undefined,
  title: string,
  link: string,
) => {
  const response = await api.put(`/api/v1/services/links/${id}`, {
    title: title,
    link: link,
  });

  return response.data;
};

export const create_service_link = async (
  id: number | string | undefined,
  title: string,
  link: string,
) => {
  const response = await api.post(`/api/v1/services/links/${id}`, {
    title: title,
    link: link,
  });

  return response.data;
};

export const update_service_doc = async (
  id: number | string | undefined,
  content: any,
) => {
  const response = await api.put(`/api/v1/services/docs/${id}`, {
    content: content,
  });

  return response.data;
};

export const create_service_doc = async (
  id: number | string | undefined,
  title: string,
) => {
  const response = await api.post(`/api/v1/services/docs/${id}`, {
    title: title,
  });

  return response.data;
};

export const display_service_docs = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/services/docs/${id}`);

  return response.data;
};

export const display_service_files = async (
  system_id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/services/files/${system_id}`);

  return response.data;
};

export const upload_service_file = async (
  system_id: string,
  file: File,
  title: string,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const response = await api.post(
    `/api/v1/services/files/upload/${system_id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const delete_service_file = async (
  file_id: number | string | undefined,
) => {
  const response = await api.delete(`/api/v1/services/files/${file_id}`);

  return response.data;
};

export const upload_service_servers_excel = async (
  service_id: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/v1/services/virtual_machines/upload/excel/${service_id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const display_service_sites = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/services/sites/${id}`);

  return response.data;
};

export const execute_service_script = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/services/scripts/execute/${id}`);

  return response.data;
};

export const create_service_script = async (
  service_id: number | string | undefined,
  filename: string,
  title: string,
  description: string,
) => {
  const response = await api.post(
    `/api/v1/services/scripts/${service_id}?filename=${filename}`,
    {
      title: title,
      description: description,
    },
  );

  return response.data;
};

export const delete_service_script = async (
  script_id: number | string | undefined,
) => {
  const response = await api.delete(`/api/v1/services/scripts/${script_id}`);

  return response.data;
};

export const edit_service_script = async (
  script_id: number | string | undefined,
  service_id: number | string | undefined,
  title: string,
  description: string,
  filename: string,
) => {
  const response = await api.patch(`/api/v1/services/scripts/${script_id}`, {
    service_id: service_id,
    title: title,
    description: description,
    filename: filename,
  });

  return response.data;
};
