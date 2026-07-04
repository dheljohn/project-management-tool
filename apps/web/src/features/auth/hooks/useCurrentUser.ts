import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/api"; // adjust path to match your structure

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get("/testlogin/me");
      return data; // { id, user_id }
    },
    staleTime: 1000 * 60 * 5,
  });
};
