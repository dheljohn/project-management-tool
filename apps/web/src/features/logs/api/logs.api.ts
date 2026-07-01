import api from "../../../../lib/api";
import { ChangeLog } from "../../../types/types";

export const getChangeLogByProject = async (
  projectId: number,
): Promise<ChangeLog[]> => {
  const { data } = await api.get("/test04/get_change_log_by_project", {
    params: { projectId },
  });
  return data;
};
