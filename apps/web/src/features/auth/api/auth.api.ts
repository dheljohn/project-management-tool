import api from "../../../../lib/api";

export interface LoginPayload {
  user_id: string;
  password: string;
}
export interface RegisterPayload {
  user_id: string;
  email: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload) => {
  const { data } = await api.post("/testlogin", payload);
  return data;
};
export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await api.post("/test01/create_member", payload);
  return data;
};
