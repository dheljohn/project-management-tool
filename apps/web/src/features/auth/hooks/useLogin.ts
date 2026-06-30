"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser } from "../api/auth.api";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (_, variables) => {
      localStorage.setItem("user_id", variables.user_id);
      router.push("/projects");
    },
  });
};
