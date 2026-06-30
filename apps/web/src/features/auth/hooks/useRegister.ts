import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerUser, loginUser } from "../api/auth.api";
import { RegisterFormValues } from "../schemas/register.schema";

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerUser({
        user_id: values.user_id,
        email: values.email,
        password: values.password,
      });
      return loginUser({
        user_id: values.user_id,
        password: values.password,
      });
    },
    onSuccess: (_, variables) => {
      localStorage.setItem("user_id", variables.user_id);
      router.push("/projects");
    },
  });
};
