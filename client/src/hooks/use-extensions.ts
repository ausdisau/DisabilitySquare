import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { api, buildUrl } from "@shared/routes";

export function useExtensions() {
  return useQuery({
    queryKey: [api.extensions.list.path],
  });
}

export function useExtension(id: number) {
  return useQuery({
    queryKey: [api.extensions.get.path, id],
    queryFn: async () => {
      const response = await fetch(buildUrl(api.extensions.get.path, { id }));
      if (!response.ok) throw new Error('Failed to fetch extension');
      return response.json();
    },
    enabled: !!id,
  });
}

export function useExtensionLogs(id: number) {
  return useQuery({
    queryKey: [api.extensions.logs.path, id],
    queryFn: async () => {
      const response = await fetch(buildUrl(api.extensions.logs.path, { id }));
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json();
    },
    enabled: !!id,
  });
}

export function useAvailableEvents() {
  return useQuery({
    queryKey: [api.extensions.events.path],
  });
}

export function useAvailablePermissions() {
  return useQuery({
    queryKey: [api.extensions.permissions.path],
  });
}

export function useEnableExtension() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', buildUrl(api.extensions.enable.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.extensions.list.path] });
    },
  });
}

export function useDisableExtension() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', buildUrl(api.extensions.disable.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.extensions.list.path] });
    },
  });
}

export function useUninstallExtension() {
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', buildUrl(api.extensions.uninstall.path, { id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.extensions.list.path] });
    },
  });
}

export function useUpdateExtensionConfig() {
  return useMutation({
    mutationFn: async ({ id, config }: { id: number; config: Record<string, any> }) => {
      return apiRequest('PUT', buildUrl(api.extensions.updateConfig.path, { id }), config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.extensions.list.path] });
    },
  });
}
