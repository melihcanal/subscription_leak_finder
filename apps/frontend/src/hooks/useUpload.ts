import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@clerk/react";
import {uploadCsv} from "../api/client";

export function useUpload() {
    const queryClient = useQueryClient();
    const {getToken} = useAuth();

    return useMutation({
        mutationFn: async (file: File) => {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required.");
            }
            return uploadCsv(file, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["subscriptions"]});
            queryClient.invalidateQueries({queryKey: ["summary"]});
        }
    });
}
