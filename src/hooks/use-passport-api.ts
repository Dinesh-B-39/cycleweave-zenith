import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passportApi } from '@/lib/api';

interface PassportData {
  _id: string;
  passportId: string;
  lcaId: string;
  metalType: string;
  co2Emission: number;
  circularityScore: number;
  circularityGrade: string;
  totalTransportDistance: number;
  recycledContent: number;
  scenarioType: string;
  qrCodeData: string;
  provenanceEvents: Array<{
    timestamp: string;
    event: string;
    location: string;
    verified: boolean;
  }>;
  generatedAt: string;
  certifications: string[];
  doctorAnalysisId?: string;
  lcaData?: Record<string, any>;
  doctorAnalysis?: Record<string, any>;
}

export function usePassportList() {
  return useQuery({
    queryKey: ['passports'],
    queryFn: async () => {
      const result = await passportApi.list();
      if (result.error) throw new Error(result.error);
      return result.data as PassportData[];
    },
  });
}

export function usePassport(id: string | null) {
  return useQuery({
    queryKey: ['passport', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await passportApi.get(id);
      if (result.error) throw new Error(result.error);
      return result.data as PassportData;
    },
    enabled: !!id,
  });
}

export function usePassportFull(id: string | null) {
  return useQuery({
    queryKey: ['passport-full', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await passportApi.getFull(id);
      if (result.error) throw new Error(result.error);
      return result.data as PassportData;
    },
    enabled: !!id,
  });
}

export function usePassportsForLCA(lcaId: string | null) {
  return useQuery({
    queryKey: ['passports-lca', lcaId],
    queryFn: async () => {
      if (!lcaId) return [];
      const result = await passportApi.getForLca(lcaId);
      if (result.error) throw new Error(result.error);
      return result.data as PassportData[];
    },
    enabled: !!lcaId,
  });
}

export function useGeneratePassport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ lcaId, doctorAnalysisId }: { lcaId: string; doctorAnalysisId?: string }) => {
      const result = await passportApi.generate(lcaId, doctorAnalysisId);
      if (result.error) throw new Error(result.error);
      return result.data as PassportData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports'] });
    },
  });
}

export function useDeletePassport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await passportApi.delete(id);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passports'] });
    },
  });
}
