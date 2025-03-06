import { Header } from "encore.dev/api";

export interface LoginBody {
  email?: string;
  password: string;
}

export interface LoginResponse extends BaseAuthParams {
  message: string;
}

export interface RegisterBody extends LoginBody {
  email: string;
}
export type LogoutResponse = Omit<
  LoginResponse,
  "xcsrfToken" | "authorization"
>;

export type BaseAuthParams = {
  refreshToken: Header<"Set-Cookie">;
  csrfToken: Header<"Set-Cookie">;
  xcsrfToken: Header<"X-CSRF-Token">;
  authorization: Header<"Authorization">;
};

export type AuthParams = Pick<LoginResponse, "authorization">;
