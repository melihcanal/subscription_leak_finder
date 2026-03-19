import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCsv } from "../api/client";

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    }
  });
}
