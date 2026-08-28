import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

/**
 * Wraps a write call with standard invalidate + toast behaviour for the
 * file-detail screen. Invalidates ["application", id] on success.
 */
export function useDetailMutation<TVars>(
  applicationId: string | undefined,
  fn: (vars: TVars) => Promise<unknown>,
  opts: { successMessage: string; onDone?: () => void },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      toast.success(opts.successMessage);
      opts.onDone?.();
    },
    onError: (err: unknown) => {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });
}
