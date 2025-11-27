import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lcaApi } from '@/lib/api';
import { LCAData } from '@/types/lca';

export function useLCAList() {
  return useQuery({
    queryKey: ['lcas'],
    queryFn: async () => {
      const result = await lcaApi.list();
      if (result.error) throw new Error(result.error);
      return result.data as LCAData[];
    },
  });
}

export function useLCA(id: string | null) {
  return useQuery({
    queryKey: ['lca', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await lcaApi.get(id);
      if (result.error) throw new Error(result.error);
      return result.data as LCAData & { _id: string };
    },
    enabled: !!id,
  });
}

export function useCreateLCA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<LCAData>) => {
      const result = await lcaApi.create(data);
      if (result.error) throw new Error(result.error);
      return result.data as LCAData & { _id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lcas'] });
    },
  });
}

export function useUpdateLCA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LCAData> }) => {
      const result = await lcaApi.update(id, data);
      if (result.error) throw new Error(result.error);
      return result.data as LCAData & { _id: string };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lca', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lcas'] });
    },
  });
}

export function useDeleteLCA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await lcaApi.delete(id);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lcas'] });
    },
  });
}

export function useSimulateLCA() {
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<LCAData> }) => {
      const result = await lcaApi.simulate(id, changes);
      if (result.error) throw new Error(result.error);
      return result.data as {
        original: { co2Emission: number; circularityScore: number };
        simulated: { co2Emission: number; circularityScore: number };
        difference: { co2Emission: number; circularityScore: number };
      };
    },
  });
}
