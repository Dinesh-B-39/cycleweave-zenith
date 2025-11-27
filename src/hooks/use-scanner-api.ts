import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scannerApi } from '@/lib/api';
import { ScanResult } from '@/types/lca';

interface ScanResultWithId extends ScanResult {
  _id: string;
  createdAt: string;
  lcaId: string | null;
  filename?: string;
}

export function useScanList() {
  return useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const result = await scannerApi.list();
      if (result.error) throw new Error(result.error);
      return result.data as ScanResultWithId[];
    },
  });
}

export function useScan(id: string | null) {
  return useQuery({
    queryKey: ['scan', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await scannerApi.get(id);
      if (result.error) throw new Error(result.error);
      return result.data as ScanResultWithId;
    },
    enabled: !!id,
  });
}

export function useAnalyzeScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (imageBase64?: string) => {
      const result = await scannerApi.analyze(imageBase64);
      if (result.error) throw new Error(result.error);
      return result.data as ScanResultWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
}

export function useUploadAndAnalyze() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const result = await scannerApi.upload(file);
      if (result.error) throw new Error(result.error);
      return result.data as ScanResultWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
}

export function useApplyScanToLCA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ scanId, lcaId }: { scanId: string; lcaId: string }) => {
      const result = await scannerApi.applyToLca(scanId, lcaId);
      if (result.error) throw new Error(result.error);
      return result.data as { message: string; updates: Record<string, any> };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['lcas'] });
    },
  });
}
