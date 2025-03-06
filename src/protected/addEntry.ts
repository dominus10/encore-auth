import { api } from "encore.dev/api";
import { AuthParams } from "../interface";

export const addEntry = api(
  {
    auth: true,
    method: "POST",
    path: "/g/add",
    expose: true,
  },
  async (params: AuthParams): Promise<{ message: string }> => {
    return { message: "ok" };
  }
);
