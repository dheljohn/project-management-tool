import api from "../../../../lib/api";

export interface ChangePasswordPayload {
  user_id: string;
  old_password: string;
  new_password: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const { data } = await api.patch("/test01/update_member", payload);
  return data;
};
