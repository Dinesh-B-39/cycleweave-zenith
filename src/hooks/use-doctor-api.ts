import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api';
import { DoctorAnalysis } from '@/types/lca';

interface DoctorAnalysisWithId extends DoctorAnalysis {
  _id: string;
  lcaId: string;
  createdAt: string;
}

export function useDoctorAnalysisList() {
  return useQuery({
    queryKey: ['doctor-analyses'],
    queryFn: async () => {
      const result = await doctorApi.list();
      if (result.error) throw new Error(result.error);
      return result.data as DoctorAnalysisWithId[];
    },
  });
}

export function useDoctorAnalysis(id: string | null) {
  return useQuery({
    queryKey: ['doctor-analysis', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await doctorApi.get(id);
      if (result.error) throw new Error(result.error);
      return result.data as DoctorAnalysisWithId;
    },
    enabled: !!id,
  });
}

export function useDoctorAnalysisForLCA(lcaId: string | null) {
  return useQuery({
    queryKey: ['doctor-analysis-lca', lcaId],
    queryFn: async () => {
      if (!lcaId) return [];
      const result = await doctorApi.getForLca(lcaId);
      if (result.error) throw new Error(result.error);
      return result.data as DoctorAnalysisWithId[];
    },
    enabled: !!lcaId,
  });
}

export function useRunDoctorAnalysis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lcaId: string) => {
      const result = await doctorApi.analyze(lcaId);
      if (result.error) throw new Error(result.error);
      return result.data as DoctorAnalysisWithId;
    },
    onSuccess: (_, lcaId) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-analysis-lca', lcaId] });
    },
  });
}

export function useApplyImprovement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ analysisId, improvementId }: { analysisId: string; improvementId: string }) => {
      const result = await doctorApi.applyImprovement(analysisId, improvementId);
      if (result.error) throw new Error(result.error);
      return result.data as {
        message: string;
        potentialGain: number;
        changes: Record<string, any>;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lcas'] });
      queryClient.invalidateQueries({ queryKey: ['lca'] });
    },
  });
}
