import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/member.api";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
