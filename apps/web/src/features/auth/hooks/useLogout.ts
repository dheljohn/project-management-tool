import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "../../../../lib/api";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => api.post("/testlogin/logout"),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem("user_id");
      router.push("/login");
    },
  });
}
