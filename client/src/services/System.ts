import api from "./Http";

export const get_specific_system = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/systems/${id}`);

  return response.data;
};

export const get_system_virtual_machines = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/systems/virtual_machines/${id}`);
  return response.data;
};

export const get_system_dependencies = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/systems/dependencies/${id}`);
  return response.data;
};

export const get_system_authentication = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/systems/authentication/${id}`);
  return response.data;
};

export const create_system_with_name = async (system_name: string) => {
  const requestBody = {
    system_name: system_name,
    impact: null,
    owned_by: null,
    core_network: null,
    masad: null,
    secondary_site: null,
    backup_type: null,
    infrastructure_type: null,
    info: null,
    third_site: null,
    environment: null,
    cert_infrastructure: null,
    preferred_site: null,
  };

  const response = await api.post("/api/v1/systems", requestBody);

  return response.data;
};

export const update_system = async (
  id: number | string | undefined,
  field: string,
  value: any,
) => {
  const response = await api.patch(`/api/v1/systems/${id}`, {
    [field]: value,
  });
  return response.data;
};

export const update_system_total = async (
  id: number | string | undefined,
  system_name: string,
  impact: string,
  owned_by: string,
  core_network: string,
  masad: string,
  secondary_site: string,
  backup_type: string,
  infrastructure_type: string,
  active_location: string,
  info: string,
  third_site: string,
  environment: string,
  cert_infrastructure: string,
  preferred_site: string,
) => {
  const response = await api.patch(`/api/v1/systems/total/${id}`, {
    system_name,
    impact,
    owned_by,
    core_network,
    masad,
    secondary_site,
    backup_type,
    infrastructure_type,
    active_location,
    info,
    third_site,
    environment,
    cert_infrastructure,
    preferred_site,
  });

  return response.data;
};

export const update_virtual_machine = async (
  id: number | string | undefined,
  field: string,
  value: any,
) => {
  const response = await api.patch(`/api/v1/systems/virtual_machines/${id}`, {
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
  const response = await api.patch(`/api/v1/systems/virtual_machines/${id}`, {
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
  const response = await api.patch(`/api/v1/systems/dependencies/${id}`, {
    dependency: value,
  });
  return response.data;
};

export const update_authentication = async (
  id: number | string | undefined,
  value: any,
) => {
  const response = await api.patch(`/api/v1/systems/authentication/${id}`, {
    authentication_type: value,
  });
  return response.data;
};

export const create_dependency_for_system = async (
  id: number | string | undefined,
  dependency: string,
) => {
  const requestBody = {
    dependency: dependency,
  };

  const response = await api.post(
    `/api/v1/systems/dependencies/${id}`,
    requestBody,
  );

  return response.data;
};

export const create_system_authentication = async (
  id: number | string | undefined,
  authentication_type: string,
) => {
  const requestBody = {
    authentication_type: authentication_type,
  };

  const response = await api.post(
    `/api/v1/systems/authentication/${id}`,
    requestBody,
  );

  return response.data;
};

export const create_virtual_machine_for_system = async (
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
    `/api/v1/systems/virtual_machines/${id}`,
    requestBody,
  );

  return response.data;
};

export const get_system_dep_info = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/systems/dep/info/${id}`);
  return response.data;
};

export const post_system_dep_info = async (
  id: any,
  dep_parent_id: any,
  description: string,
) => {
  const response = await api.post(`/api/v1/systems/dep/info/${id}`, {
    dep_parent_id: dep_parent_id,
    description: description,
  });
  return response.data;
};

export const patch_system_dep_info = async (
  id: number | string | null,
  description: string,
) => {
  const response = await api.patch(`/api/v1/systems/dep/info/${id}`, {
    description,
  });
  return response.data;
};

export const delete_system_dep_info = async (
  id: number | string | undefined,
) => {
  const response = await api.delete(`/api/v1/systems/dep/info/delete/${id}`);

  return response.data;
};

export const delete_system_dep = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/systems/dep/delete/${id}`);

  return response.data;
};

export const delete_system_vm = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/systems/vm/delete/${id}`);

  return response.data;
};

export const delete_system_auth = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/systems/auth/delete/${id}`);

  return response.data;
};

export const get_system_core_dependencies = async (
  system_id: number | string | undefined,
) => {
  const response = await api.get(
    `/api/v1/systems/core/dependencies/${system_id}`,
  );
  return response.data;
};

export const post_system_core_dependency = async (
  system_id: number | string | undefined,
  service_id: number | string | undefined,
) => {
  const response = await api.post(
    `/api/v1/systems/core/dependencies/${system_id}`,
    {
      service_id: service_id,
    },
  );

  return response.data;
};

export const delete_system_core_dependency = async (
  id: number | string | undefined,
) => {
  const response = await api.delete(
    `/api/v1/systems/delete/core/dependency/${id}`,
  );
  return response.data;
};

// * links

export const get_system_links = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/systems/links/${id}`);

  return response.data;
};

export const delete_system_link = async (id: number | string | undefined) => {
  const response = await api.delete(`/api/v1/systems/links/${id}`);

  return response.data;
};

export const update_system_link = async (
  id: number | string | undefined,
  title: string,
  link: string,
) => {
  const response = await api.put(`/api/v1/systems/links/${id}`, {
    title: title,
    link: link,
  });

  return response.data;
};

export const create_system_link = async (
  id: number | string | undefined,
  title: string,
  link: string,
) => {
  const response = await api.post(`/api/v1/systems/links/${id}`, {
    title: title,
    link: link,
  });

  return response.data;
};

export const update_system_doc = async (
  id: number | string | undefined,
  content: any,
) => {
  const response = await api.put(`/api/v1/systems/docs/${id}`, {
    content: content,
  });

  return response.data;
};

export const create_system_doc = async (
  id: number | string | undefined,
  title: string,
) => {
  const response = await api.post(`/api/v1/systems/docs/${id}`, {
    title: title,
  });

  return response.data;
};

export const display_system_docs = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/systems/docs/${id}`);

  return response.data;
};

export const display_system_files = async (
  system_id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/systems/files/${system_id}`);

  return response.data;
};

export const upload_system_file = async (
  system_id: string,
  file: File,
  title: string,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const response = await api.post(
    `/api/v1/systems/files/upload/${system_id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const delete_system_file = async (
  file_id: number | string | undefined,
) => {
  const response = await api.delete(`/api/v1/systems/files/${file_id}`);

  return response.data;
};

export const upload_system_servers_excel = async (
  system_id: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/api/v1/systems/virtual_machines/upload/excel/${system_id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const display_system_sites = async (id: number | string | undefined) => {
  const response = await api.get(`/api/v1/systems/sites/${id}`);

  return response.data;
};

export const execute_system_script = async (
  id: number | string | undefined,
) => {
  const response = await api.get(`/api/v1/systems/scripts/execute/${id}`);

  return response.data;
};

export const create_system_script = async (
  system_id: number | string | undefined,
  filename: string,
  title: string,
  description: string,
) => {
  const response = await api.post(
    `/api/v1/systems/scripts/${system_id}?filename=${filename}`,
    {
      title: title,
      description: description,
    },
  );

  return response.data;
};

export const delete_system_script = async (
  script_id: number | string | undefined,
) => {
  const response = await api.delete(`/api/v1/systems/scripts/${script_id}`);

  return response.data;
};

export const edit_system_script = async (
  script_id: number | string | undefined,
  system_id: number | string | undefined,
  title: string,
  description: string,
  filename: string,
) => {
  const response = await api.patch(`/api/v1/systems/scripts/${script_id}`, {
    system_id: system_id,
    title: title,
    description: description,
    filename: filename,
  });

  return response.data;
};
