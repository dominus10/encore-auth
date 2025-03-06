import { api } from "encore.dev/api";
import { LogoutResponse } from "../interface";

export const logoutUser = api(
  { auth: true, method: "POST", path: "/logout", expose: true },
  async (): Promise<LogoutResponse> => {
    return {
      message: "Logout successful!",
      refreshToken: `refresh_token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict`,
      csrfToken: `csrf_token=; Secure; Path=/; Max-Age=0; SameSite=Strict`,
    };
  }
);
