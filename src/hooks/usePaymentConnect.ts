import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/services/payment.service";
import { queryKeys } from "@/config/query-keys";

export const useConnectStatus = () =>
  useQuery({
    queryKey: queryKeys.connectStatus,
    queryFn: () => paymentService.getConnectStatus().then((r) => r.data.data),
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.stripeOnboardingStatus === "COMPLETE" ? false : 5_000,
    refetchOnWindowFocus: true,
  });

export const useCreateConnectAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => paymentService.createConnectAccount().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connectStatus });
    },
  });
};

export const useCreateAccountSession = () =>
  useMutation({
    mutationFn: () =>
      paymentService.createConnectAccountSession().then((r) => r.data.clientSecret),
  });
