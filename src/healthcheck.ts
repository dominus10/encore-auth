import { api } from "encore.dev/api";

export const healthcheck = api(
  { method: "GET", path: "/", expose: true },
  async (): Promise<Response> => {
    return { message: "Server online!" };
  },
);

interface Response {
  message: string;
}
